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
          return `  // ${method.toUpperCase()} ${path} - List ${entitySegment}
  http.get(\`\${mockConfig.baseUrl}${path}\`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
    
    // Generate dataset
    const totalItems = faker.number.int(mockConfig.dataSetSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    const items = Array.from({ length: endIndex - startIndex }, () => ${mockFunctionName}());
    
    // Apply search filter if provided
    const filteredItems = search 
      ? items.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
      : items;

    return HttpResponse.json({
      ${entitySegment}: filteredItems,
      pagination: {
        page,
        pageSize,
        total: totalItems,
        totalPages: Math.ceil(totalItems / pageSize)
      }
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