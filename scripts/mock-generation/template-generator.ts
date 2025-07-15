// Template-based mock generator
import { SchemaAnalyzer, type SchemaAnalysis } from "./schema-analyzer";
import {
  TemplateEngine,
  type TemplateContext,
  type SchemaContext,
  type OperationContext,
  type QueryParamContext,
  type FilterContext,
  type ErrorContext,
  type DiscriminatorContext,
} from "./template-engine";

export interface TemplateConfig {
  baseUrl?: string;
  delay?: number | { min: number; max: number };
  errorRate?: number;
  locale?: string;
  seed?: number;
  dataSetSize?: { min: number; max: number };
  generateRelationships?: boolean;
}

export class TemplateMockGenerator {
  private analyzer: SchemaAnalyzer;
  private templateEngine: TemplateEngine;
  private config: Required<TemplateConfig>;
  private schemaAnalyses: Map<string, SchemaAnalysis> = new Map();
  private spec: any;

  constructor(spec: any, config: TemplateConfig = {}) {
    this.spec = spec;
    this.analyzer = new SchemaAnalyzer(spec);
    this.templateEngine = new TemplateEngine();
    this.config = {
      baseUrl: "",
      delay: { min: 0, max: 0 },
      errorRate: 0,
      locale: "en",
      seed: 12345,
      dataSetSize: { min: 10, max: 50 },
      generateRelationships: true,
      ...config,
    };

    // Analyze all schemas upfront
    this.analyzeAllSchemas();
  }

  private analyzeAllSchemas(): void {
    const schemas = this.analyzer["schemas"];
    for (const schemaName of Object.keys(schemas)) {
      const analysis = this.analyzer.analyzeSchema(schemaName);
      if (analysis) {
        this.schemaAnalyses.set(schemaName, analysis);
      }
    }
  }

  public generateMockHandlers(): string {
    const context = this.buildTemplateContext();
    return this.templateEngine.render("base", context);
  }

  private buildTemplateContext(): TemplateContext {
    const schemas = this.buildSchemaContexts();
    const usesDateFormatting = this.checkUsesDateFormatting(schemas);

    return {
      apiName: this.extractApiName(),
      timestamp: new Date().toISOString(),
      baseUrl: this.config.baseUrl,
      delay:
        typeof this.config.delay === "number"
          ? { min: this.config.delay, max: this.config.delay }
          : this.config.delay,
      errorRate: this.config.errorRate,
      dataSetSize: this.config.dataSetSize,
      usesDateFormatting,
      schemas,
      operations: this.buildOperationContexts(),
    };
  }

  private extractApiName(): string {
    const spec = this.analyzer["spec"];
    return spec.info?.title || "Generated API";
  }

  private checkUsesDateFormatting(schemas: SchemaContext[]): boolean {
    return schemas.some((schema) =>
      schema.properties.some((prop) => prop.fakerMethod.includes("format(")),
    );
  }

  private buildSchemaContexts(): SchemaContext[] {
    const contexts: SchemaContext[] = [];

    for (const [schemaName, analysis] of this.schemaAnalyses) {
      contexts.push({
        name: schemaName,
        lowerName: schemaName.toLowerCase(),
        primaryKey: this.findPrimaryKey(analysis) || undefined,
        properties: analysis.properties.map((prop) => ({
          name: prop.name,
          type: prop.type,
          fakerMethod: prop.fakerMethod,
          isRequired: prop.isRequired,
        })),
        hasDiscriminatedResponses:
          this.hasDiscriminatedResponsesForSchema(schemaName),
        discriminatedSchemas: this.getDiscriminatedSchemasForSchema(schemaName),
      });
    }

    return contexts;
  }

  private buildOperationContexts(): OperationContext[] {
    const contexts: OperationContext[] = [];
    const spec = this.analyzer["spec"];

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (typeof operation !== "object" || !operation) continue;

        const context = this.buildSingleOperationContext(
          path,
          method,
          operation,
        );
        if (context) {
          contexts.push(context);
        }
      }
    }

    return contexts;
  }

  private buildSingleOperationContext(
    path: string,
    method: string,
    operation: any,
  ): OperationContext | null {
    const entityInfo = this.extractEntityInfo(path);
    if (!entityInfo) return null;

    const mswPath = path.replace(/\{([^}]+)\}/g, ":$1");
    const hasPathParams = path.includes("{");
    const queryParams = this.extractQueryParams(operation);

    // Determine operation type
    const isGetSingle = method === "get" && hasPathParams;
    const isGetList = method === "get" && !hasPathParams;
    const isCreate = method === "post";
    const isUpdate = method === "put" || method === "patch";
    const isDelete = method === "delete";

    return {
      method: method.toLowerCase(),
      path,
      mswPath,
      description:
        operation.summary ||
        operation.description ||
        `${method.toUpperCase()} ${path}`,
      entityName: this.getResponseSchemaName(operation) || entityInfo.entityName,
      entityPlural: entityInfo.entityPlural,
      lowerEntityName: (this.getResponseSchemaName(operation) || entityInfo.entityName).toLowerCase(),
      responseProperties: this.getResponseProperties(operation),
      primaryKey: "id", // TODO: Extract from schema
      pathParam: entityInfo.pathParam,

      // Operation type flags
      isListOperation: isGetList,
      isSingleOperation: isGetSingle,
      isCreateOperation: isCreate,
      isUpdateOperation: isUpdate,
      isDeleteOperation: isDelete,

      // Parameter handling
      hasParams:
        hasPathParams || queryParams.length > 0 || isCreate || isUpdate,
      hasBody: isCreate || isUpdate,
      hasPathParams,
      queryParams,

      // List operation specific - detect based on parameter metadata
      hasSearch: this.hasSearchCapability(operation),
      searchConfig: this.extractSearchConfig(operation),
      hasPagination: this.hasPaginationCapability(queryParams),
      hasSorting: this.hasSortingCapability(queryParams),
      filters: this.extractFilters(operation, queryParams),

      // Error handling
      errorScenarios: true,
      defaultError: this.getDefaultError(method, entityInfo.entityName),

      // Response discrimination
      discriminator: this.extractDiscriminator(operation),
    };
  }

  private extractEntityInfo(path: string): {
    entityName: string;
    entityPlural: string;
    pathParam?: string;
  } | null {
    const segments = path.split("/").filter(Boolean);
    const nonParamSegments = segments.filter(
      (segment) => !segment.startsWith("{"),
    );
    const entitySegment = nonParamSegments[nonParamSegments.length - 1];

    if (!entitySegment) return null;

    // Extract entity name from the path segment
    const entityPlural = entitySegment;
    const entityName = this.deriveEntityName(entitySegment);
    const pathParam = segments
      .find((segment) => segment.startsWith("{"))
      ?.slice(1, -1);

    return {
      entityName,
      entityPlural,
      pathParam,
    };
  }

  private extractQueryParams(operation: any): QueryParamContext[] {
    const allParams = operation.parameters || [];
    
    // First resolve all parameter references
    const resolvedParams = allParams.map((param: any) => {
      return param.$ref ? this.resolveRef(param.$ref) : param;
    });
    
    // Then filter for query parameters
    const queryParams = resolvedParams.filter((p: any) => p.in === "query");

    return queryParams.map((resolvedParam: any) => {
      return {
        name: resolvedParam.name,
        type: resolvedParam.schema?.type || "string",
        isNumber: resolvedParam.schema?.type === "integer" || resolvedParam.schema?.type === "number",
        required: resolvedParam.required || false,
        defaultValue: this.getDefaultValueForParam(resolvedParam.name, resolvedParam.schema),
      };
    });
  }

  private getDefaultValueForParam(paramName: string, paramSchema?: any): string | undefined {
    // Generate appropriate default values based on schema type and name patterns
    if (paramSchema?.default !== undefined) {
      return JSON.stringify(paramSchema.default);
    }
    
    const type = paramSchema?.type || "string";
    const lowerName = paramName.toLowerCase();
    
    // Generic pattern-based defaults
    if (lowerName.includes("page") && type === "integer") {
      return "1";
    }
    if (lowerName.includes("size") && type === "integer") {
      return "20";
    }
    if (lowerName.includes("limit") && type === "integer") {
      return "10";
    }
    if (lowerName.includes("order") && type === "string") {
      return "asc";
    }
    if (type === "boolean") {
      return "false";
    }
    
    return undefined;
  }

  private extractSearchConfig(
    operation: any,
  ): { fields?: string[] } | undefined {
    // Look for any parameter that could be used for searching
    const searchParam = operation.parameters?.find(
      (p: any) => {
        const name = p.name?.toLowerCase() || "";
        return (name.includes("search") || 
                name.includes("query") || 
                name.includes("filter")) && 
               p["x-mock-search"];
      }
    );

    return searchParam
      ? {
          fields: searchParam["x-mock-search"]?.fields,
        }
      : undefined;
  }

  private extractFilters(
    operation: any,
    queryParams: QueryParamContext[],
  ): FilterContext[] {
    // All query parameters are potential filters unless marked otherwise
    const nonSpecialParams = queryParams.filter((p) => {
      // Skip parameters that are explicitly marked as special purpose
      const param = operation.parameters?.find((op: any) => {
        const resolved = op.$ref ? this.resolveRef(op.$ref) : op;
        return resolved.name === p.name;
      });
      
      const resolved = param?.$ref ? this.resolveRef(param.$ref) : param;
      return !resolved?.["x-special-purpose"]; // Allow TypeSpec to mark special parameters
    });

    return nonSpecialParams.map((param) => {
      const operationParam = operation.parameters?.find(
        (p: any) => p.name === param.name,
      );
      const mockConfig = this.extractMockMetadata(operationParam);

      return {
        name: param.name,
        field: mockConfig?.field || param.name,
        isBooleanField: param.type === "boolean",
        config:
          mockConfig?.type === "mockFilter"
            ? {
                strategy:
                  (mockConfig.strategy as
                    | "exact"
                    | "partial-match"
                    | "boolean-choice") || "exact",
                field: mockConfig.field || param.name,
              }
            : undefined,
      };
    });
  }

  private extractMockMetadata(param: any): {
    type: string;
    field?: string;
    strategy?: string;
    fields?: string[];
  } | null {
    if (param?.["x-mock-filter"]) {
      return {
        type: "mockFilter",
        field: param["x-mock-filter"].field,
        strategy: param["x-mock-filter"].strategy,
      };
    }

    if (param?.["x-mock-search"]) {
      return {
        type: "mockSearch",
        fields: param["x-mock-search"].fields,
      };
    }

    return null;
  }

  private getDefaultError(method: string, entityName: string): ErrorContext {
    switch (method.toLowerCase()) {
      case "get":
        return {
          type: "Not found",
          message: `${entityName} not found`,
          status: 404,
        };
      case "post":
        return {
          type: "Validation failed",
          message: `Invalid ${entityName.toLowerCase()} data`,
          status: 400,
        };
      case "put":
      case "patch":
      case "delete":
        return {
          type: "Not found",
          message: `${entityName} not found`,
          status: 404,
        };
      default:
        return {
          type: "Internal error",
          message: "Something went wrong",
          status: 500,
        };
    }
  }

  private extractDiscriminator(
    operation: any,
  ): DiscriminatorContext | undefined {
    const discriminatorConfig = operation["x-mock-response"];
    if (!discriminatorConfig?.case || !discriminatorConfig?.when) {
      return undefined;
    }

    return {
      case: discriminatorConfig.case,
      when: discriminatorConfig.when,
      default: discriminatorConfig.default || "default",
    };
  }

  private findPrimaryKey(analysis: SchemaAnalysis): string | undefined {
    // Look for common primary key patterns
    const idField = analysis.properties.find(
      (p) => p.name === "id" || p.name === "Id" || p.name === "ID",
    );

    return idField?.name;
  }

  private hasDiscriminatedResponsesForSchema(schemaName: string): boolean {
    // Check if any operation has discriminated responses that include this schema
    for (const [, pathItem] of Object.entries(this.spec.paths || {})) {
      for (const [, operation] of Object.entries(pathItem || {})) {
        if (
          typeof operation === "object" &&
          operation &&
          operation["x-mock-response"]
        ) {
          const discriminator = operation["x-mock-response"];
          if (
            discriminator.when &&
            Object.values(discriminator.when).includes(schemaName)
          ) {
            return true;
          }
          if (discriminator.default === schemaName) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private getDiscriminatedSchemasForSchema(schemaName: string): any[] {
    const schemas: any[] = [];

    // Find operations that use this schema as the base
    for (const [, pathItem] of Object.entries(this.spec.paths || {})) {
      for (const [, operation] of Object.entries(pathItem || {})) {
        if (
          typeof operation === "object" &&
          operation &&
          operation["x-mock-response"]
        ) {
          const discriminator = operation["x-mock-response"];
          if (discriminator.default === schemaName && discriminator.when) {
            // Generate mapping for each discriminated schema
            for (const [, targetSchema] of Object.entries(discriminator.when)) {
              schemas.push({
                name: targetSchema,
                mapping: this.generateSchemaMapping(
                  schemaName,
                  targetSchema as string,
                ),
              });
            }
          }
        }
      }
    }

    return schemas;
  }

  private generateSchemaMapping(
    sourceSchema: string,
    targetSchema: string,
  ): any[] {
    const sourceSchemaSpec = this.spec.components?.schemas?.[sourceSchema];
    const targetSchemaSpec = this.spec.components?.schemas?.[targetSchema];

    if (!sourceSchemaSpec || !targetSchemaSpec) {
      return [];
    }

    const mapping: any[] = [];
    const sourceProps = sourceSchemaSpec.properties || {};
    const targetProps = targetSchemaSpec.properties || {};

    // Map each target property to source properties
    for (const [targetProp, targetPropSpec] of Object.entries(targetProps)) {
      // Skip properties that have their own x-mock-data (let them generate independently)
      if (
        targetPropSpec &&
        typeof targetPropSpec === "object" &&
        targetPropSpec["x-mock-data"]
      ) {
        continue;
      }

      if (sourceProps[targetProp]) {
        // Direct mapping
        mapping.push({
          source: targetProp,
          target: targetProp,
        });
      } else {
        // Custom mapping based on property semantics
        const customMapping = this.getCustomMapping(targetProp, sourceProps);
        if (customMapping) {
          mapping.push({
            source: customMapping.source,
            target: targetProp,
            transform: customMapping.transform,
          });
        }
      }
    }

    return mapping;
  }

  private getCustomMapping(
    targetProp: string,
    sourceProps: any,
  ): { source: string; transform?: string } | null {
    // Handle common mapping patterns
    switch (targetProp) {
      case "name":
        if (sourceProps.firstName && sourceProps.lastName) {
          return {
            source: "firstName",
            transform: "`${item.firstName} ${item.lastName}`",
          };
        }
        if (sourceProps.fullName) {
          return { source: "fullName" };
        }
        break;
      case "status":
        if (sourceProps.isActive) {
          return {
            source: "isActive",
            transform: 'item.isActive ? "active" : "inactive"',
          };
        }
        break;
      case "fullName":
        if (sourceProps.firstName && sourceProps.lastName) {
          return {
            source: "firstName",
            transform: "`${item.firstName} ${item.lastName}`",
          };
        }
        break;
      case "memberSince":
        if (sourceProps.createdAt) {
          return { source: "createdAt" };
        }
        break;
    }

    return null;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private deriveEntityName(pathSegment: string): string {
    // Convert path segment to a valid JavaScript identifier and capitalize
    const sanitized = this.sanitizeIdentifier(pathSegment);
    return this.capitalize(sanitized);
  }

  private sanitizeIdentifier(name: string): string {
    // Convert kebab-case to camelCase for valid JavaScript identifiers
    return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  }

  private getResponseSchemaName(operation: any): string | null {
    // Extract the schema name from the response
    const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
    if (!successResponse?.content?.['application/json']?.schema) {
      return null;
    }

    const schema = successResponse.content['application/json'].schema;
    
    // Handle array responses (list operations)
    if (schema.type === 'object' && schema.properties?.records?.type === 'array') {
      const itemsSchema = schema.properties.records.items;
      if (itemsSchema?.$ref) {
        return this.extractSchemaNameFromRef(itemsSchema.$ref);
      }
    }
    
    // Handle direct schema references
    if (schema.$ref) {
      return this.extractSchemaNameFromRef(schema.$ref);
    }
    
    return null;
  }

  private extractSchemaNameFromRef(ref: string): string {
    // Extract schema name from #/components/schemas/SchemaName
    const parts = ref.split('/');
    return parts[parts.length - 1];
  }

  private resolveRef(ref: string): any {
    // Resolve OpenAPI reference like "#/components/parameters/DateRangeQueryParams.start_date"
    const path = ref.replace('#/', '').split('/');
    let current = this.spec;
    
    for (const segment of path) {
      current = current?.[segment];
      if (!current) {
        console.warn(`Could not resolve reference: ${ref}`);
        return {};
      }
    }
    
    return current;
  }

  private hasSearchCapability(operation: any): boolean {
    // Check if operation has extensions or parameters that indicate search capability
    return operation["x-has-search"] || false;
  }

  private hasPaginationCapability(queryParams: QueryParamContext[]): boolean {
    // Check if operation has extensions that indicate pagination
    // For now, return false since usage-stats doesn't use pagination
    return false;
  }

  private hasSortingCapability(queryParams: QueryParamContext[]): boolean {
    // Check if operation has extensions that indicate sorting
    // For now, return false since usage-stats doesn't use sorting
    return false;
  }

  private getResponseProperties(operation: any): Record<string, any> | null {
    const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
    if (!successResponse?.content?.['application/json']?.schema) {
      return null;
    }

    const schema = successResponse.content['application/json'].schema;
    return schema.properties || null;
  }

}
