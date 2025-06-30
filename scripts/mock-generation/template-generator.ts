// Template-based mock generator
import { SchemaAnalyzer, type SchemaAnalysis } from './schema-analyzer';
import { 
  TemplateEngine, 
  type TemplateContext, 
  type SchemaContext, 
  type OperationContext,
  type QueryParamContext,
  type FilterContext,
  type ErrorContext,
  type DiscriminatorContext
} from './template-engine';

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

  constructor(spec: any, config: TemplateConfig = {}) {
    this.analyzer = new SchemaAnalyzer(spec);
    this.templateEngine = new TemplateEngine();
    this.config = {
      baseUrl: '',
      delay: { min: 0, max: 0 },
      errorRate: 0,
      locale: 'en',
      seed: 12345,
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

  public generateMockHandlers(): string {
    const context = this.buildTemplateContext();
    return this.templateEngine.render('base', context);
  }

  private buildTemplateContext(): TemplateContext {
    return {
      apiName: this.extractApiName(),
      timestamp: new Date().toISOString(),
      baseUrl: this.config.baseUrl,
      delay: typeof this.config.delay === 'number' 
        ? { min: this.config.delay, max: this.config.delay }
        : this.config.delay,
      errorRate: this.config.errorRate,
      dataSetSize: this.config.dataSetSize,
      schemas: this.buildSchemaContexts(),
      operations: this.buildOperationContexts(),
    };
  }

  private extractApiName(): string {
    const spec = this.analyzer['spec'];
    return spec.info?.title || 'Generated API';
  }

  private buildSchemaContexts(): SchemaContext[] {
    const contexts: SchemaContext[] = [];
    
    for (const [schemaName, analysis] of this.schemaAnalyses) {
      contexts.push({
        name: schemaName,
        lowerName: schemaName.toLowerCase(),
        primaryKey: this.findPrimaryKey(analysis),
        properties: analysis.properties.map(prop => ({
          name: prop.name,
          type: prop.type,
          fakerMethod: prop.fakerMethod,
          isRequired: prop.required,
        })),
        hasDiscriminatedResponses: this.hasDiscriminatedResponsesForSchema(schemaName),
        // TODO: Add discriminated schemas mapping
      });
    }
    
    return contexts;
  }

  private buildOperationContexts(): OperationContext[] {
    const contexts: OperationContext[] = [];
    const spec = this.analyzer['spec'];
    
    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (typeof operation !== 'object' || !operation) continue;
        
        const context = this.buildSingleOperationContext(path, method, operation);
        if (context) {
          contexts.push(context);
        }
      }
    }
    
    return contexts;
  }

  private buildSingleOperationContext(path: string, method: string, operation: any): OperationContext | null {
    const entityInfo = this.extractEntityInfo(path);
    if (!entityInfo) return null;

    const mswPath = path.replace(/\{([^}]+)\}/g, ':$1');
    const hasPathParams = path.includes('{');
    const queryParams = this.extractQueryParams(operation);
    
    // Determine operation type
    const isGetSingle = method === 'get' && hasPathParams;
    const isGetList = method === 'get' && !hasPathParams;
    const isCreate = method === 'post';
    const isUpdate = method === 'put' || method === 'patch';
    const isDelete = method === 'delete';

    return {
      method: method.toLowerCase(),
      path,
      mswPath,
      description: operation.summary || operation.description || `${method.toUpperCase()} ${path}`,
      entityName: entityInfo.entityName,
      entityPlural: entityInfo.entityPlural,
      lowerEntityName: entityInfo.entityName.toLowerCase(),
      primaryKey: 'id', // TODO: Extract from schema
      pathParam: entityInfo.pathParam,
      
      // Operation type flags
      isListOperation: isGetList,
      isSingleOperation: isGetSingle,
      isCreateOperation: isCreate,
      isUpdateOperation: isUpdate,
      isDeleteOperation: isDelete,
      
      // Parameter handling
      hasParams: hasPathParams || queryParams.length > 0 || isCreate || isUpdate,
      hasBody: isCreate || isUpdate,
      hasPathParams,
      queryParams,
      
      // List operation specific
      hasSearch: queryParams.some(p => p.name === 'search'),
      searchConfig: this.extractSearchConfig(operation),
      hasPagination: queryParams.some(p => p.name === 'page' || p.name === 'pageSize'),
      hasSorting: queryParams.some(p => p.name === 'sortBy' || p.name === 'sortOrder'),
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
    const segments = path.split('/').filter(Boolean);
    const nonParamSegments = segments.filter(segment => !segment.startsWith('{'));
    const entitySegment = nonParamSegments[nonParamSegments.length - 1];
    
    if (!entitySegment) return null;
    
    const entityName = this.capitalize(this.singularize(entitySegment));
    const pathParam = segments.find(segment => segment.startsWith('{'))?.slice(1, -1);
    
    return {
      entityName,
      entityPlural: entitySegment,
      pathParam,
    };
  }

  private extractQueryParams(operation: any): QueryParamContext[] {
    const params = operation.parameters?.filter((p: any) => p.in === 'query') || [];
    
    return params.map((param: any) => ({
      name: param.name,
      type: param.schema?.type || 'string',
      isNumber: param.schema?.type === 'integer' || param.schema?.type === 'number',
      defaultValue: this.getDefaultValueForParam(param.name),
    }));
  }

  private getDefaultValueForParam(paramName: string): string | undefined {
    switch (paramName) {
      case 'page': return '1';
      case 'pageSize': return '20';
      case 'sortOrder': return 'asc';
      default: return undefined;
    }
  }

  private extractSearchConfig(operation: any): { fields?: string[] } | undefined {
    const searchParam = operation.parameters?.find((p: any) => 
      p.name === 'search' && p['x-mock-search']
    );
    
    return searchParam ? {
      fields: searchParam['x-mock-search']?.fields
    } : undefined;
  }

  private extractFilters(operation: any, queryParams: QueryParamContext[]): FilterContext[] {
    const nonSpecialParams = queryParams.filter(p => 
      !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(p.name)
    );
    
    return nonSpecialParams.map(param => {
      const operationParam = operation.parameters?.find((p: any) => p.name === param.name);
      const mockConfig = this.extractMockMetadata(operationParam);
      
      return {
        name: param.name,
        field: mockConfig?.field || param.name,
        isBooleanField: param.type === 'boolean',
        config: mockConfig?.type === 'mockFilter' ? {
          strategy: (mockConfig.strategy as 'exact' | 'partial-match' | 'boolean-inverse') || 'exact',
          field: mockConfig.field || param.name,
        } : undefined,
      };
    });
  }

  private extractMockMetadata(param: any): { 
    type: string; 
    field?: string; 
    strategy?: string; 
    fields?: string[] 
  } | null {
    if (param?.['x-mock-filter']) {
      return {
        type: 'mockFilter',
        field: param['x-mock-filter'].field,
        strategy: param['x-mock-filter'].strategy
      };
    }
    
    if (param?.['x-mock-search']) {
      return {
        type: 'mockSearch',
        fields: param['x-mock-search'].fields
      };
    }
    
    return null;
  }

  private getDefaultError(method: string, entityName: string): ErrorContext {
    switch (method.toLowerCase()) {
      case 'get':
        return {
          type: 'Not found',
          message: `${entityName} not found`,
          status: 404,
        };
      case 'post':
        return {
          type: 'Validation failed',
          message: `Invalid ${entityName.toLowerCase()} data`,
          status: 400,
        };
      case 'put':
      case 'patch':
      case 'delete':
        return {
          type: 'Not found',
          message: `${entityName} not found`,
          status: 404,
        };
      default:
        return {
          type: 'Internal error',
          message: 'Something went wrong',
          status: 500,
        };
    }
  }

  private extractDiscriminator(operation: any): DiscriminatorContext | undefined {
    const discriminatorConfig = operation['x-mock-response'];
    if (!discriminatorConfig?.case || !discriminatorConfig?.when) {
      return undefined;
    }
    
    return {
      case: discriminatorConfig.case,
      when: discriminatorConfig.when,
      default: discriminatorConfig.default || 'default',
    };
  }

  private findPrimaryKey(analysis: SchemaAnalysis): string {
    // Look for common primary key patterns
    const idField = analysis.properties.find(p => 
      p.name === 'id' || p.name === 'Id' || p.name === 'ID'
    );
    
    return idField?.name || 'id';
  }

  private hasDiscriminatedResponsesForSchema(_schemaName: string): boolean {
    // TODO: Implement proper detection based on spec analysis
    return false;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private singularize(str: string): string {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
    if (str.endsWith('es')) return str.slice(0, -2);
    if (str.endsWith('s')) return str.slice(0, -1);
    return str;
  }
}