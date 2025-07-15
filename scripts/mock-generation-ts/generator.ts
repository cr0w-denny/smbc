#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

interface OpenAPISpec {
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
    parameters: Record<string, any>;
  };
}

interface MockConfig {
  baseUrl: string;
  dataSetSize: { min: number; max: number };
  errorRate: number;
}

class TypeScriptMockGenerator {
  private spec: OpenAPISpec;
  private config: MockConfig;

  constructor(spec: OpenAPISpec, config: MockConfig) {
    this.spec = spec;
    this.config = config;
  }

  generate(): string {
    const imports = this.generateImports();
    const config = this.generateConfig();
    const schemas = this.generateSchemas();
    const handlers = this.generateHandlers();
    const resetFunction = this.generateResetFunction();

    return [imports, config, schemas, handlers, resetFunction].join("\n\n");
  }

  private generateImports(): string {
    // Check if we need date formatting
    const needsDateFormatting = this.checkNeedsDateFormatting();
    const formatImport = needsDateFormatting
      ? "\nimport { format } from 'date-fns';"
      : "";

    return `import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';${formatImport}`;
  }

  private checkNeedsDateFormatting(): boolean {
    for (const schema of Object.values(this.spec.components.schemas)) {
      if (this.schemaHasDateFormatting(schema)) {
        return true;
      }
    }
    return false;
  }

  private schemaHasDateFormatting(schema: any): boolean {
    if (!schema.properties) return false;

    for (const prop of Object.values(schema.properties)) {
      if ((prop as any)["x-mock-data"]?.format) {
        return true;
      }
    }
    return false;
  }

  private generateConfig(): string {
    return `const mockConfig = {
  baseUrl: '${this.config.baseUrl}',
  delay: { min: 0, max: 200 },
  errorRate: ${this.config.errorRate},
  dataSetSize: { min: ${this.config.dataSetSize.min}, max: ${this.config.dataSetSize.max} },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}`;
  }

  private generateSchemas(): string {
    const usedSchemas = this.findUsedSchemas();
    const schemaHandlers = usedSchemas
      .map((schemaName) => this.generateSchemaHandlers(schemaName))
      .join("\n\n");
    const transformFunctions = this.generateTransformFunctions();

    return `${schemaHandlers}\n\n${transformFunctions}`;
  }

  private findUsedSchemas(): string[] {
    const usedSchemas = new Set<string>();
    
    // Find schemas used in GET operation responses
    for (const [_path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (method === "get") {
          const schemaName = this.getItemSchemaNameFromResponse(operation);
          if (schemaName && schemaName !== "Unknown") {
            usedSchemas.add(schemaName);
          }
        }
      }
    }
    
    return Array.from(usedSchemas);
  }

  private getItemSchemaNameFromResponse(operation: any): string {
    const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
    if (!successResponse?.content?.['application/json']?.schema) {
      return "Unknown";
    }

    const schema = successResponse.content['application/json'].schema;
    
    // Handle direct array responses (e.g., "type": "array", "items": { "$ref": "..." })
    if (schema.type === 'array' && schema.items?.$ref) {
      return this.extractSchemaNameFromRef(schema.items.$ref);
    }
    
    // Handle direct schema references - need to resolve and check if it's a wrapper
    if (schema.$ref) {
      const referencedSchema = this.resolveRef(schema.$ref);
      // Check if the referenced schema has array properties pointing to items
      if (referencedSchema?.type === 'object' && referencedSchema.properties) {
        for (const [_key, prop] of Object.entries(referencedSchema.properties)) {
          if ((prop as any).type === 'array' && (prop as any).items?.$ref) {
            return this.extractSchemaNameFromRef((prop as any).items.$ref);
          }
        }
      }
      // If no array properties found, return the referenced schema itself
      return this.extractSchemaNameFromRef(schema.$ref);
    }
    
    // Handle list operations - look for array items in properties
    if (schema.type === 'object' && schema.properties) {
      for (const [_key, prop] of Object.entries(schema.properties)) {
        if ((prop as any).type === 'array' && (prop as any).items?.$ref) {
          return this.extractSchemaNameFromRef((prop as any).items.$ref);
        }
      }
    }
    
    return "Unknown";
  }

  private generateSchemaHandlers(schemaName: string): string {
    const schema = this.spec.components.schemas[schemaName];
    const generator = this.generateMockFunction(schemaName, schema);
    const dataStore = this.generateDataStore(schemaName);

    return `${generator}\n\n${dataStore}`;
  }

  private generateMockFunction(schemaName: string, schema: any): string {
    const properties = schema.properties || {};
    const mockProps = Object.entries(properties)
      .map(([propName, propSchema]: [string, any]) => {
        const mockValue = this.generateMockValue(propSchema);
        return `    ${propName}: ${mockValue}`;
      })
      .join(",\n");

    return `function generate${schemaName}(overrides = {}) {
  return {
${mockProps},
    ...overrides
  };
}`;
  }

  private generateMockValue(schema: any): string {
    // Check for x-mock-data extension first
    if (schema["x-mock-data"]) {
      return this.generateMockFromExtension(schema["x-mock-data"]);
    }

    // Fall back to type-based generation
    switch (schema.type) {
      case "string":
        if (schema.format === "email") return "faker.internet.email()";
        if (schema.format === "date-time")
          return "faker.date.recent().toISOString()";
        if (schema.format === "date")
          return 'faker.date.recent().toISOString().split("T")[0]';
        if (schema.format === "uuid") return "faker.string.uuid()";
        return "faker.lorem.word()";
      case "integer":
      case "number":
        return "faker.number.int({ min: 1, max: 1000 })";
      case "boolean":
        return "faker.datatype.boolean()";
      case "array":
        return "[]";
      case "object":
        return "{}";
      default:
        return "null";
    }
  }

  private generateMockFromExtension(mockData: any): string {
    if (mockData.faker) {
      let fakerCall = `faker.${mockData.faker}()`;

      // Handle unique values - use the new faker.helpers.uniqueArray for better performance
      if (mockData.unique) {
        fakerCall = `faker.helpers.uniqueArray(() => ${fakerCall}, 1)[0]`;
      }

      // Handle weighted boolean
      if (mockData.weight && mockData.faker === "datatype.boolean") {
        fakerCall = `faker.datatype.boolean({ probability: ${mockData.weight} })`;
      }

      return fakerCall;
    }

    // Handle relative dates
    if (mockData.relative) {
      const [from, to] = mockData.relative.split(" to ");
      let dateCall = `faker.date.between({ from: '${from}', to: '${to}' })`;

      if (mockData.format) {
        dateCall = `format(${dateCall}, '${mockData.format}')`;
      }

      return dateCall;
    }

    return "null";
  }

  private generateDataStore(schemaName: string): string {
    const varName = schemaName.toLowerCase();

    return `let ${varName}DataStore: Map<string, any> = new Map();
let ${varName}DataInitialized = false;

function initialize${schemaName}DataStore() {
  if (${varName}DataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generate${schemaName}({}));
  
  items.forEach((item, index) => {
    ${varName}DataStore.set(String(index), item);
  });
  
  ${varName}DataInitialized = true;
}

function getAll${schemaName}s(): any[] {
  initialize${schemaName}DataStore();
  return Array.from(${varName}DataStore.values());
}`;
  }

  private generateHandlers(): string {
    const handlers = [];

    for (const [path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (typeof operation !== "object" || !operation) continue;
        
        switch (method.toLowerCase()) {
          case "get":
            handlers.push(this.generateGetHandler(path, operation));
            break;
          case "post":
            handlers.push(this.generatePostHandler(path, operation));
            break;
          case "put":
          case "patch":
            handlers.push(this.generateUpdateHandler(path, operation, method));
            break;
          case "delete":
            handlers.push(this.generateDeleteHandler(path, operation));
            break;
        }
      }
    }

    return `export const handlers = [
${handlers.map((h) => `  ${h}`).join(",\n")}
];`;
  }

  private generateGetHandler(path: string, operation: any): string {
    const mswPath = path.replace(/\{([^}]+)\}/g, ":$1");
    const rawResponseSchema = this.getResponseSchema(operation);
    const responseSchema = rawResponseSchema?.$ref ? this.resolveRef(rawResponseSchema.$ref) : rawResponseSchema;
    const queryParams = this.extractQueryParams(operation);
    const schemaName = this.getItemSchemaNameFromResponse(operation);

    const usedParams = this.getUsedParams(operation, queryParams);
    const paramExtraction = usedParams
      .map(
        (param) =>
          `    const ${param.name} = url.searchParams.get('${param.name}');`,
      )
      .join("\n");

    const filtering = this.generateFiltering(operation, queryParams);
    const searchFiltering = this.generateSearchFiltering(operation);
    const paginationCode = this.generatePaginationCode(operation, queryParams);
    const sortingCode = this.generateSortingCode(operation, queryParams);
    const responseDiscrimination =
      this.generateResponseDiscrimination(operation);

    // Determine which data store to use - get the actual item type, not wrapper
    const itemSchemaName = this.getItemSchemaNameFromResponse(operation);
    const dataStoreSchemaName = itemSchemaName !== "Unknown" ? itemSchemaName : schemaName;
    const responseBody = this.generateResponseBody(responseSchema, dataStoreSchemaName, operation, rawResponseSchema);

    const hasDiscrimination = responseDiscrimination.trim().length > 0;
    const needsUrl = usedParams.length > 0 || hasDiscrimination;
    const requestDestructure = needsUrl ? '{ request }' : '{ request: _request }';
    
    return `http.get(\`\${mockConfig.baseUrl}${mswPath}\`, async (${requestDestructure}) => {
    await delay();
    ${needsUrl ? `
    const url = new URL(request.url);` : ''}
    
${paramExtraction}
    
    const allItems = getAll${dataStoreSchemaName}s();
    let filteredItems = allItems;
    
${filtering}
${searchFiltering}
${sortingCode}
${paginationCode}
${responseDiscrimination}
    ${hasDiscrimination ? '' : `
    return HttpResponse.json(${responseBody});`}
  })`;
  }

  private generatePostHandler(path: string, operation: any): string {
    const mswPath = path.replace(/\{([^}]+)\}/g, ":$1");
    const schemaName = this.getItemSchemaNameFromResponse(operation);
    
    return `http.post(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ request }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Creation failed' }, { status: 400 });
    }
    
    const body = await request.json() as any;
    const newItem = generate${schemaName}({ ...body, id: faker.string.uuid() });
    
    return HttpResponse.json(newItem, { status: 201 });
  })`;
  }

  private generateUpdateHandler(path: string, operation: any, method: string): string {
    const mswPath = path.replace(/\{([^}]+)\}/g, ":$1");
    const schemaName = this.getItemSchemaNameFromResponse(operation);
    const hasPathParams = path.includes("{");
    
    const requestParam = 'request';
    const paramsParam = hasPathParams ? ', params' : '';
    
    return `http.${method}(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ ${requestParam}${paramsParam} }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: '${schemaName} not found' }, { status: 404 });
    }
    
    const body = await request.json() as any;
    const updatedItem = generate${schemaName}({ ${hasPathParams ? '...(params as any), ' : ''}...body });
    
    return HttpResponse.json(updatedItem);
  })`;
  }

  private generateDeleteHandler(path: string, operation: any): string {
    const mswPath = path.replace(/\{([^}]+)\}/g, ":$1");
    let schemaName = this.getItemSchemaNameFromResponse(operation);
    const hasPathParams = path.includes("{");
    
    // If we can't determine schema from response, try to infer from path
    if (schemaName === "Unknown") {
      schemaName = this.inferSchemaFromPath(path);
    }
    
    // Check if delete returns content or just status
    const hasContent = operation.responses?.['200']?.content;
    
    const requestParam = hasPathParams ? 'request: _request' : 'request: _request';
    const paramsParam = hasPathParams ? ', params' : '';
    
    if (hasContent) {
      // For DELETE with content but unknown schema, return a simple response
      if (schemaName === "Unknown") {
        return `http.delete(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ ${requestParam}${paramsParam} }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ message: "Deleted successfully" });
  })`;
      } else {
        return `http.delete(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ ${requestParam}${paramsParam} }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: '${schemaName} not found' }, { status: 404 });
    }
    
    const deletedItem = generate${schemaName}(${hasPathParams ? 'params as any' : '{}'});
    
    return HttpResponse.json(deletedItem);
  })`;
      }
    } else {
      // For DELETE with no content (204), params are typically not used
      const deleteParams = hasPathParams ? 'request: _request, params: _params' : 'request: _request';
      return `http.delete(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ ${deleteParams} }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: '${schemaName} not found' }, { status: 404 });
    }
    
    return new HttpResponse(null, { status: 204 });
  })`;
    }
  }

  private getResponseSchema(operation: any): any {
    const response =
      operation.responses?.["200"]?.content?.["application/json"]?.schema;
    return response;
  }

  private getSchemaNameFromResponse(operation: any): string {
    const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
    if (!successResponse?.content?.['application/json']?.schema) {
      return "Unknown";
    }

    const schema = successResponse.content['application/json'].schema;
    
    // Handle direct schema references
    if (schema.$ref) {
      return this.extractSchemaNameFromRef(schema.$ref);
    }
    
    // Handle array responses (list operations) - look for array items in properties
    if (schema.type === 'object' && schema.properties) {
      for (const [_key, prop] of Object.entries(schema.properties)) {
        if ((prop as any).type === 'array' && (prop as any).items?.$ref) {
          return this.extractSchemaNameFromRef((prop as any).items.$ref);
        }
      }
    }
    
    return "Unknown";
  }

  private extractSchemaNameFromRef(ref: string): string {
    return ref.split("/").pop() || "Unknown";
  }

  private inferSchemaFromPath(path: string): string {
    // Extract resource name from path like /products/:id -> Product
    const segments = path.split('/').filter(s => s && !s.startsWith('{') && !s.startsWith(':'));
    if (segments.length > 0) {
      const resourceName = segments[segments.length - 1];
      // Convert from plural to singular and capitalize
      let singular = resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;
      return singular.charAt(0).toUpperCase() + singular.slice(1);
    }
    return "Unknown";
  }

  private extractQueryParams(
    operation: any,
  ): Array<{ name: string; type: string }> {
    const params = operation.parameters || [];
    const resolved = params.map((param: any) => {
      if (param.$ref) {
        return this.resolveRef(param.$ref);
      }
      return param;
    });

    return resolved
      .filter((p: any) => p.in === "query")
      .map((p: any) => ({
        name: p.name,
        type: p.schema?.type || "string",
      }));
  }

  private resolveRef(ref: string): any {
    const path = ref.replace("#/", "").split("/");
    let current = this.spec as any;

    for (const segment of path) {
      current = current?.[segment];
    }

    return current || {};
  }

  private generateFiltering(
    operation: any,
    queryParams: Array<{ name: string; type: string }>,
  ): string {
    const filterParams = queryParams.filter((param) => {
      const resolvedParam = this.getResolvedParam(operation, param.name);
      return resolvedParam?.["x-mock-filter"];
    });

    return filterParams
      .map((param) => {
        const resolvedParam = this.getResolvedParam(operation, param.name);
        const filterConfig = resolvedParam?.["x-mock-filter"];

        if (!filterConfig) return "";

        const { field = param.name, strategy = "exact" } = filterConfig;

        switch (strategy) {
          case "partial-match":
            return `    if (${param.name} !== null && ${param.name} !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.${field}?.toString().toLowerCase().includes(${param.name}.toLowerCase())
      );
    }`;
          case "exact":
            return `    if (${param.name} !== null && ${param.name} !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.${field}?.toString() === ${param.name}
      );
    }`;
          case "boolean-choice":
            const enumValues = resolvedParam?.schema?.enum || [];
            const mapping = filterConfig.mapping || {};

            if (Object.keys(mapping).length > 0) {
              // Use explicit mapping from x-mock-filter config
              const mappingCases = Object.entries(mapping)
                .map(
                  ([enumVal, boolVal]) =>
                    `        case '${enumVal}': return ${boolVal};`,
                )
                .join("\n");

              return `    if (${param.name} !== null && ${param.name} !== '') {
      const boolValue = (() => {
        switch(${param.name}) {
${mappingCases}
          default: return false;
        }
      })();
      filteredItems = filteredItems.filter((item: any) => item.${field} === boolValue);
    }`;
            } else if (enumValues.length >= 2) {
              // Convention: first enum value = true
              const [trueValue] = enumValues;
              return `    if (${param.name} !== null && ${param.name} !== '') {
      const boolValue = ${param.name} === '${trueValue}';
      filteredItems = filteredItems.filter((item: any) => item.${field} === boolValue);
    }`;
            } else {
              return `    if (${param.name} !== null && ${param.name} !== '') {
      const boolValue = ${param.name} === 'true';
      filteredItems = filteredItems.filter((item: any) => item.${field} === boolValue);
    }`;
            }
          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n");
  }

  private generateSearchFiltering(operation: any): string {
    const searchParam = operation.parameters?.find((p: any) => {
      const resolved = p.$ref ? this.resolveRef(p.$ref) : p;
      return resolved?.["x-mock-search"];
    });

    if (!searchParam) return "";

    const resolved = searchParam.$ref
      ? this.resolveRef(searchParam.$ref)
      : searchParam;
    const searchConfig = resolved?.["x-mock-search"];
    const paramName = resolved?.name;

    if (!searchConfig?.fields || !paramName) return "";

    const fieldChecks = searchConfig.fields
      .map(
        (field: string) =>
          `item.${field}?.toString().toLowerCase().includes(${paramName}.toLowerCase())`,
      )
      .join(" || ");

    return `    if (${paramName} !== null && ${paramName} !== '') {
      filteredItems = filteredItems.filter((item: any) => ${fieldChecks});
    }`;
  }

  private generatePaginationCode(
    operation: any,
    queryParams: Array<{ name: string; type: string }>,
  ): string {
    const hasPagination = queryParams.some((param) => {
      const resolved = this.getResolvedParam(operation, param.name);
      return resolved?.["x-mock-pagination"];
    });

    if (!hasPagination) {
      return `    const paginatedItems = filteredItems;`;
    }

    return `    const pageNum = parseInt(page || '1');
    const pageSizeNum = parseInt(pageSize || '20');
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);`;
  }

  private generateSortingCode(
    operation: any,
    queryParams: Array<{ name: string; type: string }>,
  ): string {
    const hasSorting = queryParams.some((param) => {
      const resolved = this.getResolvedParam(operation, param.name);
      return resolved?.["x-mock-sort"];
    });

    if (!hasSorting) return "";

    return `    if (sortBy) {
      filteredItems.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }`;
  }

  private generateResponseDiscrimination(operation: any): string {
    const discriminatorConfig = operation["x-mock-response"];
    if (!discriminatorConfig?.case || !discriminatorConfig?.when) {
      return "";
    }

    // Check if we actually have meaningful transforms
    const transforms = this.findDiscriminatedSchemas();
    const hasTransforms = transforms.some(({ sourceSchema, targetSchema }) => {
      const sourceSpec = this.spec.components.schemas[sourceSchema];
      const targetSpec = this.spec.components.schemas[targetSchema];
      return sourceSpec && targetSpec && sourceSchema !== targetSchema;
    });

    if (!hasTransforms) {
      return ""; // Skip discrimination if no actual transformations exist
    }

    // Get the response schema to determine if we need to wrap the response
    const rawResponseSchema = this.getResponseSchema(operation);
    const responseSchema = rawResponseSchema?.$ref ? this.resolveRef(rawResponseSchema.$ref) : rawResponseSchema;
    const needsWrapper = responseSchema?.type === 'object' && responseSchema?.properties;

    const conditions = Object.entries(discriminatorConfig.when)
      .map(([paramValue, schemaName]) => {
        if (needsWrapper) {
          const responseBody = this.generateResponseBodyForDiscrimination(responseSchema, `transformItemsTo${schemaName}(paginatedItems)`);
          return `      case '${paramValue}':
        return HttpResponse.json(${responseBody});`;
        } else {
          return `      case '${paramValue}':
        return HttpResponse.json(transformItemsTo${schemaName}(paginatedItems));`;
        }
      })
      .join("\n");

    const defaultCase = discriminatorConfig.default
      ? needsWrapper
        ? (() => {
            const responseBody = this.generateResponseBodyForDiscrimination(responseSchema, `transformItemsTo${discriminatorConfig.default}(paginatedItems)`);
            return `      default:
        return HttpResponse.json(${responseBody});`;
          })()
        : `      default:
        return HttpResponse.json(transformItemsTo${discriminatorConfig.default}(paginatedItems));`
      : "      default:\n        return HttpResponse.json(paginatedItems);";

    return `    // Response discrimination based on ${discriminatorConfig.case}
    switch (${discriminatorConfig.case}) {
${conditions}
${defaultCase}
    }`;
  }

  private getUsedParams(operation: any, queryParams: Array<{ name: string; type: string }>): Array<{ name: string; type: string }> {
    const usedParams = [];
    
    // Always include pagination params if pagination is enabled
    const hasPagination = queryParams.some((param) => {
      const resolved = this.getResolvedParam(operation, param.name);
      return resolved?.["x-mock-pagination"];
    });
    
    if (hasPagination) {
      const pageParam = queryParams.find(p => p.name === 'page');
      const pageSizeParam = queryParams.find(p => p.name === 'pageSize');
      if (pageParam) usedParams.push(pageParam);
      if (pageSizeParam) usedParams.push(pageSizeParam);
    }
    
    // Always include sorting params if sorting is enabled
    const hasSorting = queryParams.some((param) => {
      const resolved = this.getResolvedParam(operation, param.name);
      return resolved?.["x-mock-sort"];
    });
    
    if (hasSorting) {
      const sortByParam = queryParams.find(p => p.name === 'sortBy');
      const sortOrderParam = queryParams.find(p => p.name === 'sortOrder');
      if (sortByParam) usedParams.push(sortByParam);
      if (sortOrderParam) usedParams.push(sortOrderParam);
    }
    
    // Include filter params
    const filterParams = queryParams.filter((param) => {
      const resolved = this.getResolvedParam(operation, param.name);
      return resolved?.["x-mock-filter"];
    });
    usedParams.push(...filterParams);
    
    // Include search params
    const searchParam = operation.parameters?.find((p: any) => {
      const resolved = p.$ref ? this.resolveRef(p.$ref) : p;
      return resolved?.["x-mock-search"];
    });
    if (searchParam) {
      const resolved = searchParam.$ref ? this.resolveRef(searchParam.$ref) : searchParam;
      const searchQueryParam = queryParams.find(p => p.name === resolved.name);
      if (searchQueryParam) usedParams.push(searchQueryParam);
    }
    
    // Include response discrimination param if configured
    const discriminatorConfig = operation["x-mock-response"];
    if (discriminatorConfig?.case) {
      const discriminatorParam = queryParams.find(p => p.name === discriminatorConfig.case);
      if (discriminatorParam) usedParams.push(discriminatorParam);
    }
    
    // Remove duplicates
    return usedParams.filter((param, index, arr) => 
      arr.findIndex(p => p.name === param.name) === index
    );
  }

  private getResolvedParam(operation: any, paramName: string): any {
    const param = operation.parameters?.find((p: any) => {
      const resolved = p.$ref ? this.resolveRef(p.$ref) : p;
      return resolved.name === paramName;
    });

    return param?.$ref ? this.resolveRef(param.$ref) : param;
  }

  private generateResponseBody(
    responseSchema: any,
    _schemaName: string,
    operation: any,
    rawResponseSchema?: any,
  ): string {
    // Handle direct array responses
    if (responseSchema?.type === 'array') {
      return `paginatedItems`;
    }
    
    // Handle single item responses - check the raw response schema for $ref
    if (rawResponseSchema?.$ref) {
      const responseSchemaName = this.extractSchemaNameFromRef(rawResponseSchema.$ref);
      if (responseSchemaName === _schemaName) {
        return `paginatedItems[0] || {}`;
      }
    }
    
    // Fallback: if the response schema matches the data schema,
    // return the first item from paginatedItems
    if (responseSchema?.$ref) {
      const responseSchemaName = this.extractSchemaNameFromRef(responseSchema.$ref);
      if (responseSchemaName === _schemaName) {
        return `paginatedItems[0] || {}`;
      }
    }
    
    if (!responseSchema?.properties) {
      return `paginatedItems[0] || {}`;
    }

    const properties = Object.entries(responseSchema.properties)
      .map(([key, prop]: [string, any]) => {
        let value;
        // sensible defaults based on type
        if (prop.type === "array") {
          // Check if this array references the schema we're using for data
          if (prop.items?.$ref) {
            const arrayItemSchema = this.extractSchemaNameFromRef(prop.items.$ref);
            if (arrayItemSchema === _schemaName) {
              value = "paginatedItems";
            } else {
              value = "[]";
            }
          } else {
            value = "[]";
          }
        } else if (prop.type === "integer" || prop.type === "number") {
          value = "0";
        } else if (prop.type === "object") {
          value = "{}";
        } else if (prop.type === "string") {
          value = '""';
        } else if (prop.type === "boolean") {
          value = "false";
        } else {
          value = "null";
        }

        return `      "${key}": ${value}`;
      })
      .join(",\n");

    return `{\n${properties}\n    }`;
  }

  private generateTransformFunctions(): string {
    const discriminatedSchemas = this.findDiscriminatedSchemas();

    return discriminatedSchemas
      .map(({ sourceSchema, targetSchema }) => {
        return this.generateTransformFunction(sourceSchema, targetSchema);
      })
      .join("\n\n");
  }

  private findDiscriminatedSchemas(): Array<{
    sourceSchema: string;
    targetSchema: string;
  }> {
    const pairs: Array<{ sourceSchema: string; targetSchema: string }> = [];

    // Find all x-mock-response configurations
    for (const [, pathItem] of Object.entries(this.spec.paths || {})) {
      for (const [, operation] of Object.entries(pathItem || {})) {
        if (typeof operation === "object" && operation?.["x-mock-response"]) {
          const config = operation["x-mock-response"];
          const sourceSchema = this.getSchemaNameFromResponse(operation);

          if (config.when && sourceSchema) {
            for (const targetSchema of Object.values(config.when)) {
              pairs.push({
                sourceSchema,
                targetSchema: targetSchema as string,
              });
            }
          }

          if (
            config.default &&
            sourceSchema &&
            config.default !== sourceSchema
          ) {
            pairs.push({ sourceSchema, targetSchema: config.default });
          }
        }
      }
    }

    return pairs;
  }

  private generateTransformFunction(
    sourceSchema: string,
    targetSchema: string,
  ): string {
    const sourceSpec = this.spec.components.schemas[sourceSchema];
    const targetSpec = this.spec.components.schemas[targetSchema];

    if (!sourceSpec || !targetSpec || sourceSchema === targetSchema) {
      return `function transformItemsTo${targetSchema}(items: any[]): any[] {
  return items;
}`;
    }

    const mappings = this.generatePropertyMappings(sourceSpec, targetSpec);

    // If no meaningful mappings, just return the items as-is
    if (!mappings.trim()) {
      return `function transformItemsTo${targetSchema}(items: any[]): any[] {
  return items;
}`;
    }

    return `function transformItemsTo${targetSchema}(items: any[]): any[] {
  return items.map(_item => ({
${mappings}
  }));
}`;
  }

  private generatePropertyMappings(sourceSpec: any, targetSpec: any): string {
    const sourceProps = sourceSpec.properties || {};
    const targetProps = targetSpec.properties || {};

    const mappings = [];

    for (const [targetProp, targetPropSpec] of Object.entries(targetProps)) {
      // Skip properties with custom x-mock-data (they generate independently)
      if (
        targetPropSpec &&
        typeof targetPropSpec === "object" &&
        (targetPropSpec as any)["x-mock-data"]
      ) {
        const mockValue = this.generateMockFromExtension(
          (targetPropSpec as any)["x-mock-data"],
        );
        mappings.push(`    ${targetProp}: ${mockValue}`);
        continue;
      }

      if (sourceProps[targetProp]) {
        // Direct mapping
        mappings.push(`    ${targetProp}: item.${targetProp}`);
      } else {
        // Fallback to mock generation
        const mockValue = this.generateMockValue(targetPropSpec as any);
        mappings.push(`    ${targetProp}: ${mockValue}`);
      }
    }

    return mappings.join(",\n");
  }

  private generateResponseBodyForDiscrimination(responseSchema: any, itemsVariable: string): string {
    if (!responseSchema?.properties) {
      return itemsVariable;
    }

    const properties = Object.entries(responseSchema.properties)
      .map(([key, prop]: [string, any]) => {
        let value;
        if (prop.type === "array") {
          // Use the transformed items for array properties
          value = itemsVariable;
        } else if (prop.type === "integer" || prop.type === "number") {
          // For pagination info, use appropriate values
          if (key === "total") value = "filteredItems.length";
          else if (key === "page") value = "pageNum";
          else if (key === "pageSize") value = "pageSizeNum";
          else value = "0";
        } else if (prop.type === "object") {
          value = "{}";
        } else if (prop.type === "string") {
          value = '""';
        } else if (prop.type === "boolean") {
          value = "false";
        } else {
          value = "null";
        }

        return `      "${key}": ${value}`;
      })
      .join(",\n");

    return `{\n${properties}\n    }`;
  }

  private generateResetFunction(): string {
    const usedSchemas = this.findUsedSchemas();
    
    const resetStatements = usedSchemas
      .map((schemaName) => {
        const varName = schemaName.toLowerCase();
        return `  // Reset ${schemaName} data
  ${varName}DataStore.clear();
  ${varName}DataInitialized = false;`;
      })
      .join("\n");

    return `// Reset function to clear all data stores and initialization flags
export function resetMocks() {
${resetStatements}
  
  console.log('Mock data stores reset');
}`;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const inputFile = args
    .find((arg) => arg.startsWith("--input="))
    ?.split("=")[1];
  const outputFile = args
    .find((arg) => arg.startsWith("--output="))
    ?.split("=")[1];
  const baseUrl =
    args.find((arg) => arg.startsWith("--base-url="))?.split("=")[1] || "";

  if (!inputFile || !outputFile) {
    console.error(
      "Usage: tsx generator.ts --input=<openapi.json> --output=<output.ts> --base-url=<base-url>",
    );
    process.exit(1);
  }

  try {
    const spec = JSON.parse(readFileSync(inputFile, "utf-8"));
    const config = {
      baseUrl,
      dataSetSize: { min: 10, max: 50 },
      errorRate: 0.15,
    };

    const generator = new TypeScriptMockGenerator(spec, config);
    const output = generator.generate();

    writeFileSync(outputFile, output);
    console.log(`Generated mock handlers: ${outputFile}`);
  } catch (error) {
    console.error("Failed to generate mocks:", error);
    process.exit(1);
  }
}

// Check if running as main module (ES module compatible)
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main();
}
