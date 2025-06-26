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

  public generateMockFunction(schemaName: string): string {
    const analysis = this.schemaAnalyses.get(schemaName);
    if (!analysis) {
      return `// No analysis available for ${schemaName}`;
    }

    const functionName = `generate${schemaName}`;
    const properties = analysis.properties.map(prop => {
      return `    ${prop.name}: ${prop.fakerMethod},`;
    }).join('\n');

    return `// Mock generator for ${schemaName}
function ${functionName}(overrides = {}) {
  return {
${properties}
    ...overrides
  };
}`;
  }

  public generateHandlersForOperation(path: string, method: string, operation: any): string {
    const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Detect the main entity from the path
    const pathSegments = path.split('/').filter(Boolean);
    const entitySegment = pathSegments.find(segment => !segment.startsWith('{'));
    
    if (!entitySegment) {
      return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${path}\`, async () => {
    await delay();
    return HttpResponse.json({ message: 'Operation completed' });
  })`;
    }

    const entityName = this.capitalize(this.singularize(entitySegment));
    const analysis = this.getSchemaAnalysis(entityName);

    if (!analysis) {
      return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${path}\`, async () => {
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
  http.get(\`\${mockConfig.baseUrl}${path}\`, async () => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(${mockFunctionName}());
  })`;
        } else {
          // List endpoint
          // Extract query parameters from operation
          const queryParams = operation.parameters?.filter((p: any) => p.in === 'query') || [];
          const queryParamExtraction = queryParams
            .map((param: any) => `    const ${param.name} = url.searchParams.get('${param.name}');`)
            .join('\n');
          
          // Build filter logic for non-pagination parameters
          const filterParams = queryParams.filter((p: any) => 
            p.name !== 'page' && p.name !== 'pageSize' && p.name !== 'search'
          );
          
          const filterLogic = filterParams.length > 0 ? `
    // Apply filters for query parameters that match entity fields
    ${filterParams.map((param: any) => {
      // Check if this parameter name matches a field in the entity schema
      const field = analysis.properties.find(prop => prop.name === param.name);
      if (field) {
        // Check if the field is a boolean type
        const isBooleanField = field.type === 'boolean';
        
        if (isBooleanField) {
          return `if (${param.name} !== null) {
      filteredItems = filteredItems.filter(item => {
        if (${param.name} === 'true' || ${param.name} === 'false') {
          return item.${param.name} === (${param.name} === 'true');
        }
        // Handle other boolean representations
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
    }).filter(Boolean).join('\n    ')}` : '';
          
          return `  // ${method.toUpperCase()} ${path} - List ${entitySegment}
  http.get(\`\${mockConfig.baseUrl}${path}\`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
${queryParams.filter((p: any) => p.name !== 'page' && p.name !== 'pageSize' && p.name !== 'search')
  .map((param: any) => `    const ${param.name} = url.searchParams.get('${param.name}');`)
  .join('\n')}
    
    // Generate dataset
    const totalItems = faker.number.int(mockConfig.dataSetSize);
    const allItems = Array.from({ length: totalItems }, () => ${mockFunctionName}());
    
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

    return HttpResponse.json({
      ${entitySegment}: paginatedItems,
      total,
      page,
      pageSize
    });
  })`;
        }

      case 'post':
        return `  // ${method.toUpperCase()} ${path} - Create ${entityName.toLowerCase()}
  http.post(\`\${mockConfig.baseUrl}${path}\`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Validation failed', message: 'Invalid ${entityName.toLowerCase()} data' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const created${entityName} = ${mockFunctionName}(requestBody || {});
    
    return HttpResponse.json(created${entityName}, { status: 201 });
  })`;

      case 'put':
      case 'patch':
        return `  // ${method.toUpperCase()} ${path} - Update ${entityName.toLowerCase()}
  http.${method}(\`\${mockConfig.baseUrl}${path}\`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    const requestBody = await request.json();
    const updated${entityName} = ${mockFunctionName}(requestBody || {});
    
    return HttpResponse.json(updated${entityName});
  })`;

      case 'delete':
        return `  // ${method.toUpperCase()} ${path} - Delete ${entityName.toLowerCase()}
  http.delete(\`\${mockConfig.baseUrl}${path}\`, async () => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: '${entityName} not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ message: '${entityName} deleted successfully' });
  })`;

      default:
        return `  // ${method.toUpperCase()} ${path}
  http.${method}(\`\${mockConfig.baseUrl}${path}\`, async () => {
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