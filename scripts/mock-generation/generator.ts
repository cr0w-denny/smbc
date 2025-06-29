// Mock generator that uses schema analysis
import { SchemaAnalyzer, type SchemaAnalysis, type PropertyAnalysis } from './schema-analyzer';

export interface MockConfig {
  baseUrl?: string;
  delay?: number | { min: number; max: number };
  errorRate?: number;
  locale?: string;
  seed?: number;
  dataSetSize?: { min: number; max: number };
  generateRelationships?: boolean;
}

export interface OpenAPISpec {
  openapi: string;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
  };
}

export interface MockOverride {
  operationId: string;
  response?: any;
  status?: number;
  delay?: number;
  handler?: (req: any) => any;
}

export class MockGenerator {
  private analyzer: SchemaAnalyzer;
  private config: MockConfig;
  private schemaAnalyses: Map<string, SchemaAnalysis> = new Map();

  constructor(spec: any, config: MockConfig = {}) {
    this.analyzer = new SchemaAnalyzer(spec);
    this.config = {
      baseUrl: '',
      delay: { min: 0, max: 0 },
      errorRate: 0,
      locale: 'en',
      dataSetSize: { min: 10, max: 50 },
      generateRelationships: true,
      ...config
    };

    // Analyze all schemas upfront
    this.analyzeAllSchemas();
  }

  private analyzeAllSchemas(): void {
    const schemas = this.analyzer['schemas'];
    for (const schemaName of Object.keys(schemas)) {
      const analysis = this.analyzer.analyzeSchema(schemaName);
      if (analysis) {
        this.schemaAnalyses.set(schemaName, analysis);
      }
    }
  }

  public getAllAnalyses(): Map<string, SchemaAnalysis> {
    return this.schemaAnalyses;
  }

  public getSchemaAnalysis(schemaName: string): SchemaAnalysis | undefined {
    return this.schemaAnalyses.get(schemaName);
  }

  private extractResponseDiscriminator(operation: any): { case: string; when: Record<string, string>; default?: string } | null {
    // Check for x-mock-response extension on the operation
    if (operation['x-mock-response']) {
      const config = operation['x-mock-response'];
      if (config.case && config.when) {
        return {
          case: config.case,
          when: config.when,
          default: config.default
        };
      }
    }
    return null;
  }

  private extractMockMetadata(param: any): { type: string; field?: string; strategy?: string; fields?: string[] } | null {
    // Check for OpenAPI extensions in the parameter
    if (param['x-mock-filter']) {
      return {
        type: 'mockFilter',
        field: param['x-mock-filter'].field,
        strategy: param['x-mock-filter'].strategy
      };
    }
    
    if (param['x-mock-search']) {
      return {
        type: 'mockSearch',
        fields: param['x-mock-search'].fields
      };
    }
    
    if (param['x-mock-sort']) {
      return { type: 'mockSort' };
    }
    
    if (param['x-mock-pagination']) {
      return { type: 'mockPagination' };
    }
    
    return null;
  }

  public generateMockFunction(schemaName: string): string {
    const analysis = this.schemaAnalyses.get(schemaName);
    if (!analysis) {
      return `// No analysis available for ${schemaName}`;
    }

    const functionName = `generate${schemaName}`;
    const properties = analysis.properties.map(prop => {
      return `    ${prop.name}: ${prop.fakerMethod},`;
    }).join('\n');

    // Check if this schema is used in any discriminated responses
    const hasDiscriminatedResponses = this.hasDiscriminatedResponsesForSchema(schemaName);

    return `// Persistent data store for ${schemaName}
let ${schemaName.toLowerCase()}DataStore: Map<string, any> = new Map();
let ${schemaName.toLowerCase()}DataInitialized = false;

// Mock generator for ${schemaName}
function ${functionName}(overrides = {}) {
  return {
${properties}
    ...overrides
  };
}

// Initialize data store with consistent data
function initialize${schemaName}DataStore() {
  if (${schemaName.toLowerCase()}DataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, (_, index) => ${functionName}({ id: String(index + 1) }));
  
  items.forEach(item => {
    ${schemaName.toLowerCase()}DataStore.set(String(item.id), item);
  });
  
  ${schemaName.toLowerCase()}DataInitialized = true;
}

// Get all ${schemaName.toLowerCase()}s from the data store
function getAll${schemaName}s(): any[] {
  initialize${schemaName}DataStore();
  return Array.from(${schemaName.toLowerCase()}DataStore.values());
}

${hasDiscriminatedResponses ? `// Transform ${schemaName} to different response schemas
function transform${schemaName}ToSchema(item: any, targetSchema: string): any {
  switch (targetSchema) {
    case '${schemaName}Summary':
      return {
        id: item.id,
        name: \`\${item.firstName} \${item.lastName}\`,
        email: item.email,
        status: item.isActive ? 'active' : 'inactive'
      };
    
    case '${schemaName}Detailed':
      return {
        ...item,
        fullName: \`\${item.firstName} \${item.lastName}\`,
        memberSince: new Date(item.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      };
    
    default:
      return item;
  }
}` : ''}`;
  }

  private hasDiscriminatedResponsesForSchema(schemaName: string): boolean {
    // Check if any operations reference this schema in discriminated responses
    // This would require analyzing the full OpenAPI spec for x-mock-response extensions
    // For now, we'll check for common patterns
    return schemaName === 'User'; // Temporary - should be more dynamic
  }

  public generateHandlersForOperation(path: string, method: string, operation: any): string {
    const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Convert OpenAPI path format {id} to MSW format :id
    const mswPath = path.replace(/\{([^}]+)\}/g, ':$1');
    
    // Detect the main entity from the path
    const pathSegments = path.split('/').filter(Boolean);
    const entitySegment = pathSegments.find(segment => !segment.startsWith('{'));
    
    if (!entitySegment) {
      return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${mswPath}\`, async () => {
    await delay();
    return HttpResponse.json({ message: 'Operation completed' });
  })`;
    }

    const entityName = this.capitalize(this.singularize(entitySegment));
    const analysis = this.getSchemaAnalysis(entityName);

    if (!analysis) {
      return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${mswPath}\`, async () => {
    await delay();
    return HttpResponse.json({ message: 'Operation completed' });
  })`;
    }

    const mockFunctionName = `generate${entityName}`;

    switch (method.toLowerCase()) {
      case 'get':
        if (path.includes('{')) {
          // Single item endpoint
          return `  // ${method.toUpperCase()} ${path} - Get single ${entityName.toLowerCase()}
  http.get(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ params }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    const entityId = params.id as string;
    const item = ${entityName.toLowerCase()}DataStore.get(entityId);
    
    if (!item) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(item);
  })`;
        } else {
          // List endpoint
          // Check for response discrimination
          const discriminator = this.extractResponseDiscriminator(operation);
          
          // Extract query parameters from operation
          const queryParams = operation.parameters?.filter((p: any) => p.in === 'query') || [];
          const queryParamExtraction = queryParams
            .map((param: any) => {
              if (param.name === 'sortOrder') {
                return `    const ${param.name} = url.searchParams.get('${param.name}') || 'asc';`;
              }
              return `    const ${param.name} = url.searchParams.get('${param.name}');`;
            })
            .join('\n');
          
          // Build filter logic for non-pagination parameters
          const filterParams = queryParams.filter((p: any) => 
            p.name !== 'page' && p.name !== 'pageSize' && p.name !== 'search' && p.name !== 'sortBy' && p.name !== 'sortOrder' && p.name !== discriminator?.case
          );
          
          const filterLogic = filterParams.length > 0 ? `
    // Apply filters using OpenAPI extension metadata
    ${filterParams.map((param: any) => {
      // Extract mock metadata from OpenAPI extensions
      const mockConfig = this.extractMockMetadata(param);
      
      if (mockConfig?.type === 'mockSort') {
        return ''; // Sorting is handled separately
      }
      
      if (mockConfig?.type === 'mockPagination') {
        return ''; // Pagination is handled separately
      }
      
      if (mockConfig?.type === 'mockSearch') {
        const searchFields = mockConfig.fields || ['id'];
        return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        const searchableFields = [${searchFields.map(f => `item.${f}`).join(', ')}];
        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(${param.name}.toLowerCase())
        );
      });
    }`;
      }
      
      if (mockConfig?.type === 'mockFilter') {
        const field = mockConfig.field || param.name;
        const strategy = mockConfig.strategy || 'exact';
        
        switch (strategy) {
          case 'boolean-inverse':
            return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        const fieldValue = item.${field};
        return (${param.name} === 'active' && fieldValue) || (${param.name} === 'inactive' && !fieldValue);
      });
    }`;
          
          case 'partial-match':
            return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => 
        item.${field} && item.${field}.toString().toLowerCase().includes(${param.name}.toLowerCase())
      );
    }`;
          
          case 'exact':
          default:
            return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        if (${param.name} === 'true' || ${param.name} === 'false') {
          return item.${field} === (${param.name} === 'true');
        }
        return item.${field}?.toString() === ${param.name};
      });
    }`;
        }
      }
      
      // Fallback to field matching for parameters without metadata
      const field = analysis.properties.find(prop => prop.name === param.name);
      if (field) {
        const isBooleanField = field.type === 'boolean';
        
        if (isBooleanField) {
          return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        if (${param.name} === 'true' || ${param.name} === 'false') {
          return item.${param.name} === (${param.name} === 'true');
        }
        return false;
      });
    }`;
        } else {
          return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        return item.${param.name}?.toString().toLowerCase().includes(${param.name}.toLowerCase());
      });
    }`;
        }
      }
      return '';
    }).filter(Boolean).join('\n    ')}
    
    // Apply sorting (only if sortBy parameter exists)
    ${queryParams.some(p => p.name === 'sortBy') ? `if (sortBy && filteredItems.length > 0) {
      filteredItems.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        // Handle different data types
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortOrder === 'desc' ? -comparison : comparison;
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        } else if (aVal instanceof Date && bVal instanceof Date) {
          return sortOrder === 'desc' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
        } else {
          // Fallback to string comparison
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortOrder === 'desc' ? -comparison : comparison;
        }
      });
    }` : ''}` : '';
          
          return `  // ${method.toUpperCase()} ${path} - List ${entitySegment}
  http.get(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
${queryParams.filter((p: any) => p.name !== 'page' && p.name !== 'pageSize' && p.name !== 'search' && p.name !== discriminator?.case)
  .map((param: any) => `    const ${param.name} = url.searchParams.get('${param.name}');`)
  .join('\n')}
    
    // Get dataset from persistent store
    const allItems = getAll${entityName}s();
    
    // Apply filters
    let filteredItems = allItems;
    
    // Apply search filter if provided
    if (search) {
      filteredItems = filteredItems.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      );
    }
    ${filterLogic}
    
    // Apply pagination to filtered results
    const total = filteredItems.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    ${discriminator ? `
    // Handle discriminated responses based on query parameter: ${discriminator.case}
    const discriminatorValue = url.searchParams.get('${discriminator.case}');
    let responseSchema = '${discriminator.default || entityName}';
    
    // Map discriminator values to schema names
    const schemaMapping: Record<string, string> = ${JSON.stringify(discriminator.when)};
    if (discriminatorValue && schemaMapping[discriminatorValue]) {
      responseSchema = schemaMapping[discriminatorValue];
    }
    
    // Transform data based on selected schema
    let transformedItems = paginatedItems;
    if (responseSchema !== '${entityName}') {
      transformedItems = paginatedItems.map(item => transform${entityName}ToSchema(item, responseSchema));
    }
    
    return HttpResponse.json({
      ${entitySegment}: transformedItems,
      total,
      page,
      pageSize
    });` : `
    return HttpResponse.json({
      ${entitySegment}: paginatedItems,
      total,
      page,
      pageSize
    });`}
  })`;
        }

      case 'post':
        return `  // ${method.toUpperCase()} ${path} - Create ${entityName.toLowerCase()}
  http.post(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Validation failed', message: 'Invalid ${entityName.toLowerCase()} data' },
        { status: 400 }
      );
    }

    const requestBody = await request.json() as Record<string, any>;
    const created${entityName} = ${mockFunctionName}(requestBody || {});
    
    // Add to persistent store so it appears in subsequent GET requests
    ${entityName.toLowerCase()}DataStore.set(String(created${entityName}.id), created${entityName});
    
    return HttpResponse.json(created${entityName}, { status: 201 });
  })`;

      case 'put':
      case 'patch':
        return `  // ${method.toUpperCase()} ${path} - Update ${entityName.toLowerCase()}
  http.${method}(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ request, params }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    const requestBody = await request.json() as Record<string, any>;
    const entityId = params.id as string;
    
    // Get existing item from store
    const existingItem = ${entityName.toLowerCase()}DataStore.get(entityId);
    if (!existingItem) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }
    
    // Update item in store
    const updated${entityName} = { ...existingItem, ...requestBody, id: entityId };
    ${entityName.toLowerCase()}DataStore.set(entityId, updated${entityName});
    
    return HttpResponse.json(updated${entityName});
  })`;

      case 'delete':
        return `  // ${method.toUpperCase()} ${path} - Delete ${entityName.toLowerCase()}
  http.delete(\`\${mockConfig.baseUrl}${mswPath}\`, async ({ params }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    const entityId = params.id as string;
    
    // Check if item exists
    if (!${entityName.toLowerCase()}DataStore.has(entityId)) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }
    
    // Remove from store
    ${entityName.toLowerCase()}DataStore.delete(entityId);
    
    return HttpResponse.json({ message: \`${entityName} \${entityId} deleted successfully\` });
  })`;

      default:
        return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${mswPath}\`, async () => {
    await delay();
    return HttpResponse.json({ message: 'Operation completed' });
  })`;
    }
  }

  public capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public singularize(str: string): string {
    // Simple singularization
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
    if (str.endsWith('es')) return str.slice(0, -2);
    if (str.endsWith('s')) return str.slice(0, -1);
    return str;
  }
}