import { TemplateMockGenerator } from "../template-generator";

describe("Mock Generator - Kebab-case and References", () => {
  const testSpec = {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            "first-name": { type: "string" },
            "last-name": { type: "string" },
            "email-address": { type: "string", format: "email" },
            "is-active": { type: "boolean" },
            "created-at": { type: "string", format: "date-time" },
            profile: { $ref: "#/components/schemas/Profile" }
          },
          required: ["id", "first-name", "last-name"]
        },
        Profile: {
          type: "object",
          properties: {
            bio: { type: "string" },
            "profile-picture": { type: "string", format: "uri" },
            "phone-number": { type: "string" }
          }
        },
        UserList: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: { $ref: "#/components/schemas/User" }
            },
            "total-count": { type: "integer" }
          }
        }
      }
    },
    paths: {
      "/users": {
        get: {
          summary: "Get users",
          responses: {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserList" }
                }
              }
            }
          }
        }
      }
    }
  };

  let generator: TemplateMockGenerator;

  beforeEach(() => {
    generator = new TemplateMockGenerator(testSpec, {
      errorRate: 0,
      dataSetSize: { min: 5, max: 10 }
    });
  });

  test("should generate valid JavaScript for kebab-case properties", () => {
    const mockCode = generator.generateMockHandlers();
    
    // Should quote kebab-case properties in object literals
    expect(mockCode).toContain('"first-name": faker.person.firstName()');
    expect(mockCode).toContain('"last-name": faker.person.lastName()');
    expect(mockCode).toContain('"email-address": faker.internet.email()');
    expect(mockCode).toContain('"is-active": faker.datatype.boolean()');
    expect(mockCode).toContain('"created-at": faker.date.recent()');
    expect(mockCode).toContain('"total-count": faker.number.int({ min: 0, max: 100 })');
    
    // Should not quote regular properties
    expect(mockCode).toContain('id: faker.string.uuid()');
    expect(mockCode).toContain('bio: faker.lorem.paragraph()');
    
    // Check that the specific kebab-case properties are properly quoted
    // This is a more targeted check than trying to parse all object literals
    expect(mockCode).toMatch(/"first-name"\s*:\s*faker/);
    expect(mockCode).toMatch(/"last-name"\s*:\s*faker/);
    expect(mockCode).toMatch(/"email-address"\s*:\s*faker/);
    expect(mockCode).toMatch(/"is-active"\s*:\s*faker/);
    expect(mockCode).toMatch(/"created-at"\s*:\s*faker/);
    expect(mockCode).toMatch(/"total-count"\s*:\s*faker/);
  });

  test("should correctly detect semantic types for kebab-case properties", () => {
    const mockCode = generator.generateMockHandlers();
    
    // Kebab-case properties should get appropriate faker methods
    expect(mockCode).toContain('"first-name": faker.person.firstName()');
    expect(mockCode).toContain('"last-name": faker.person.lastName()');
    expect(mockCode).toContain('"email-address": faker.internet.email()');
    expect(mockCode).toContain('"is-active": faker.datatype.boolean()');
    expect(mockCode).toContain('"created-at": faker.date.recent()');
    expect(mockCode).toContain('"profile-picture": faker.internet.url()');
    expect(mockCode).toContain('"phone-number": faker.phone.number()');
  });

  test("should resolve $ref properties correctly", () => {
    const mockCode = generator.generateMockHandlers();
    
    // Should have Profile schema generated
    expect(mockCode).toContain('function generateProfile(');
    expect(mockCode).toContain('bio: faker.lorem.paragraph()');
    
    // Should have UserList schema generated
    expect(mockCode).toContain('function generateUserList(');
    expect(mockCode).toContain('"total-count": faker.number.int({ min: 0, max: 100 })');
    
    // User schema should reference Profile correctly
    expect(mockCode).toContain('profile: generateProfile()');
  });

  test("should handle nested references in arrays", () => {
    const mockCode = generator.generateMockHandlers();
    
    // UserList should generate an array of Users
    expect(mockCode).toContain('users: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => generateUser())');
  });

  test("should handle reserved words and special characters", () => {
    const specWithReservedWords = {
      ...testSpec,
      components: {
        schemas: {
          TestSchema: {
            type: "object",
            properties: {
              "class": { type: "string" },
              "function": { type: "string" },
              "123invalid": { type: "string" },
              "with space": { type: "string" },
              "with.dot": { type: "string" },
              normalProperty: { type: "string" }
            }
          }
        }
      }
    };

    const testGenerator = new TemplateMockGenerator(specWithReservedWords, { errorRate: 0 });
    const mockCode = testGenerator.generateMockHandlers();
    
    // Reserved words and invalid identifiers should be quoted
    expect(mockCode).toContain('"class": faker.lorem.word()');
    expect(mockCode).toContain('"function": faker.lorem.word()');
    expect(mockCode).toContain('"123invalid": faker.lorem.word()');
    expect(mockCode).toContain('"with space": faker.lorem.word()');
    expect(mockCode).toContain('"with.dot": faker.lorem.word()');
    
    // Normal properties should not be quoted
    expect(mockCode).toContain('normalProperty: faker.lorem.word()');
    
    // Check that property names are properly quoted in object literals
    expect(mockCode).toMatch(/"class"\s*:\s*faker/);
    expect(mockCode).toMatch(/"function"\s*:\s*faker/);
    expect(mockCode).toMatch(/"123invalid"\s*:\s*faker/);
    expect(mockCode).toMatch(/"with space"\s*:\s*faker/);
    expect(mockCode).toMatch(/"with\.dot"\s*:\s*faker/);
    expect(mockCode).toMatch(/normalProperty\s*:\s*faker/);
  });

  test("should handle circular references gracefully", () => {
    const specWithCircularRef = {
      openapi: "3.0.0",
      info: { title: "Test API", version: "1.0.0" },
      components: {
        schemas: {
          Node: {
            type: "object",
            properties: {
              id: { type: "string" },
              parent: { $ref: "#/components/schemas/Node" },
              children: {
                type: "array",
                items: { $ref: "#/components/schemas/Node" }
              }
            }
          }
        }
      },
      paths: {}
    };

    const testGenerator = new TemplateMockGenerator(specWithCircularRef, { errorRate: 0 });
    
    // Should not throw error with circular references
    expect(() => {
      testGenerator.generateMockHandlers();
    }).not.toThrow();
  });
});