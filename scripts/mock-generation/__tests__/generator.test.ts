import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockGenerator } from '../generator';

// Mock MSW
vi.mock('msw', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
  HttpResponse: {
    json: vi.fn((data, options) => ({ data, options })),
  },
}));

// Mock faker to ensure deterministic tests
vi.mock('@faker-js/faker', () => ({
  faker: {
    seed: vi.fn(),
    string: {
      uuid: vi.fn(() => 'test-uuid-123'),
    },
    person: {
      firstName: vi.fn(() => 'John'),
      lastName: vi.fn(() => 'Doe'),
      fullName: vi.fn(() => 'John Doe'),
    },
    internet: {
      email: vi.fn(() => 'test@example.com'),
      url: vi.fn(() => 'https://example.com'),
    },
    date: {
      recent: vi.fn(() => ({ toISOString: () => '2023-12-01T00:00:00.000Z' })),
    },
    number: {
      int: vi.fn(() => 42),
      float: vi.fn(() => 42.5),
    },
    datatype: {
      boolean: vi.fn(() => true),
    },
    lorem: {
      word: vi.fn(() => 'word'),
      sentence: vi.fn(() => 'This is a test sentence.'),
      paragraph: vi.fn(() => 'This is a test paragraph.'),
      paragraphs: vi.fn(() => 'This is test paragraphs.'),
    },
    phone: {
      number: vi.fn(() => '+1-555-123-4567'),
    },
    location: {
      streetAddress: vi.fn(() => '123 Main St'),
      city: vi.fn(() => 'Test City'),
      state: vi.fn(() => 'Test State'),
      country: vi.fn(() => 'Test Country'),
      zipCode: vi.fn(() => '12345'),
    },
    image: {
      url: vi.fn(() => 'https://example.com/image.jpg'),
      avatar: vi.fn(() => 'https://example.com/avatar.jpg'),
    },
    commerce: {
      price: vi.fn(() => '99.99'),
      department: vi.fn(() => 'Electronics'),
    },
    finance: {
      currencyCode: vi.fn(() => 'USD'),
    },
    helpers: {
      arrayElement: vi.fn((arr) => arr[0]),
    },
  },
}));

describe('MockGenerator', () => {
  let mockSpec: any;
  let generator: MockGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSpec = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          post: {
            operationId: 'createUser',
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateUserRequest' }
                }
              }
            },
            responses: {
              '201': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        },
        '/users/{id}': {
          get: {
            operationId: 'getUserById',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              },
              '404': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'email', 'firstName'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              age: { type: 'integer', minimum: 18, maximum: 100 },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              profileScore: { type: 'number', minimum: 0, maximum: 100 }
            }
          },
          CreateUserRequest: {
            type: 'object',
            required: ['email', 'firstName'],
            properties: {
              email: { type: 'string', format: 'email' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    };
  });

  describe('constructor', () => {
    it('should create generator with default config', () => {
      generator = new MockGenerator(mockSpec);
      expect(generator).toBeInstanceOf(MockGenerator);
    });

    it('should create generator with custom config', () => {
      const config = {
        baseUrl: '/api/v1',
        errorRate: 0.1,
        dataSetSize: { min: 5, max: 15 }
      };
      generator = new MockGenerator(mockSpec, config);
      expect(generator).toBeInstanceOf(MockGenerator);
    });

    it('should analyze schemas on construction', () => {
      generator = new MockGenerator(mockSpec);
      const analyses = generator.getAllAnalyses();
      expect(analyses.size).toBeGreaterThan(0);
      expect(analyses.has('User')).toBe(true);
    });
  });

  describe('generateMockFunction', () => {
    beforeEach(() => {
      generator = new MockGenerator(mockSpec);
    });

    it('should generate mock function for User schema', () => {
      const mockFunction = generator.generateMockFunction('User');
      expect(mockFunction).toContain('function generateUser(');
      expect(mockFunction).toContain('faker.string.uuid()');
      expect(mockFunction).toContain('faker.internet.email()');
      expect(mockFunction).toContain('faker.person.firstName()');
    });

    it('should handle schema with semantic field detection', () => {
      const mockFunction = generator.generateMockFunction('User');
      
      // Should detect email format
      expect(mockFunction).toContain('faker.internet.email()');
      
      // Should detect UUID format
      expect(mockFunction).toContain('faker.string.uuid()');
      
      // Should detect firstName semantic type
      expect(mockFunction).toContain('faker.person.firstName()');
    });

    it('should generate comment for unknown schema', () => {
      const mockFunction = generator.generateMockFunction('UnknownSchema');
      expect(mockFunction).toContain('No analysis available for UnknownSchema');
    });
  });

  describe('generateHandlersForOperation', () => {
    beforeEach(() => {
      generator = new MockGenerator(mockSpec);
    });

    it('should generate GET handler with pagination and filtering', () => {
      const operation = mockSpec.paths['/users'].get;
      const handler = generator.generateHandlersForOperation('/users', 'get', operation);
      
      expect(handler).toContain('http.get');
      expect(handler).toContain('pagination');
      expect(handler).toContain('search');
      expect(handler).toContain('generateUser');
    });

    it('should generate POST handler with validation', () => {
      const operation = mockSpec.paths['/users'].post;
      const handler = generator.generateHandlersForOperation('/users', 'post', operation);
      
      expect(handler).toContain('http.post');
      expect(handler).toContain('Create user');
      expect(handler).toContain('generateUser');
    });

    it('should generate GET by ID handler with 404 handling', () => {
      const operation = mockSpec.paths['/users/{id}'].get;
      const handler = generator.generateHandlersForOperation('/users/{id}', 'get', operation);
      
      expect(handler).toContain('http.get');
      expect(handler).toContain('Get single user');
      expect(handler).toContain('generateUser');
    });

    it('should handle unknown entity gracefully', () => {
      const operation = mockSpec.paths['/users'].get;
      const handler = generator.generateHandlersForOperation('/unknown', 'get', operation);
      
      expect(handler).toContain('http.get');
      expect(handler).toContain('Operation completed');
    });
  });

  describe('getSchemaAnalysis', () => {
    beforeEach(() => {
      generator = new MockGenerator(mockSpec);
    });

    it('should return analysis for existing schema', () => {
      const analysis = generator.getSchemaAnalysis('User');
      expect(analysis).toBeDefined();
      expect(analysis?.entityName).toBe('User');
      expect(analysis?.properties).toBeDefined();
      expect(analysis?.relationships).toBeDefined();
    });

    it('should return undefined for non-existent schema', () => {
      const analysis = generator.getSchemaAnalysis('NonExistent');
      expect(analysis).toBeUndefined();
    });
  });

  describe('semantic field detection', () => {
    beforeEach(() => {
      generator = new MockGenerator(mockSpec);
    });

    it('should detect email fields', () => {
      const analysis = generator.getSchemaAnalysis('User');
      const emailProperty = analysis?.properties.find(p => p.name === 'email');
      expect(emailProperty?.semanticType).toBe('email');
    });

    it('should detect name fields', () => {
      const analysis = generator.getSchemaAnalysis('User');
      const firstNameProperty = analysis?.properties.find(p => p.name === 'firstName');
      expect(firstNameProperty?.semanticType).toBe('firstName');
    });

    it('should detect ID fields', () => {
      const analysis = generator.getSchemaAnalysis('User');
      const idProperty = analysis?.properties.find(p => p.name === 'id');
      expect(idProperty?.semanticType).toBe('uuid');
    });

    it('should detect timestamp fields', () => {
      const analysis = generator.getSchemaAnalysis('User');
      const createdAtProperty = analysis?.properties.find(p => p.name === 'createdAt');
      expect(createdAtProperty?.semanticType).toBe('timestamp');
    });
  });

  describe('error handling', () => {
    it('should handle invalid OpenAPI spec gracefully', () => {
      const invalidSpec = { invalid: 'spec' };
      expect(() => new MockGenerator(invalidSpec)).not.toThrow();
    });

    it('should handle missing schemas', () => {
      const specWithoutSchemas = {
        openapi: '3.0.0',
        paths: {},
        components: {}
      };
      expect(() => new MockGenerator(specWithoutSchemas)).not.toThrow();
    });

    it('should generate fallback for missing schema references', () => {
      const specWithMissingRef = {
        openapi: '3.0.0',
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/MissingSchema' }
                    }
                  }
                }
              }
            }
          }
        },
        components: { schemas: {} }
      };
      
      generator = new MockGenerator(specWithMissingRef);
      const handler = generator.generateHandlersForOperation('/test', 'get', specWithMissingRef.paths['/test'].get);
      expect(handler).toContain('Operation completed');
    });
  });
});