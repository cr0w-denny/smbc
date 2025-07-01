import { describe, it, expect, beforeEach, vi } from "vitest";
import { TemplateMockGenerator } from "../template-generator";

// Mock the template engine
vi.mock("../template-engine", () => ({
  TemplateEngine: vi.fn().mockImplementation(() => ({
    render: vi.fn((_templateName, context) => {
      return `// Mock generated code for ${context.apiName}`;
    }),
  })),
}));

describe("TemplateMockGenerator", () => {
  let generator: TemplateMockGenerator;
  let mockSpec: any;

  beforeEach(() => {
    mockSpec = {
      openapi: "3.0.0",
      info: {
        title: "Test API",
        version: "1.0.0",
      },
      paths: {
        "/users": {
          get: {
            summary: "Get all users",
            parameters: [
              { name: "page", in: "query", schema: { type: "integer" } },
              { name: "search", in: "query", schema: { type: "string" } },
            ],
          },
          post: {
            summary: "Create user",
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateUserRequest" },
                },
              },
            },
          },
        },
        "/users/{id}": {
          get: {
            summary: "Get user by ID",
            parameters: [
              { name: "id", in: "path", schema: { type: "string" } },
            ],
          },
          patch: {
            summary: "Update user",
            parameters: [
              { name: "id", in: "path", schema: { type: "string" } },
            ],
          },
          delete: {
            summary: "Delete user",
            parameters: [
              { name: "id", in: "path", schema: { type: "string" } },
            ],
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            required: ["id", "email", "firstName"],
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          CreateUserRequest: {
            type: "object",
            required: ["email", "firstName"],
            properties: {
              email: { type: "string", format: "email" },
              firstName: { type: "string" },
              lastName: { type: "string" },
            },
          },
        },
      },
    };

    generator = new TemplateMockGenerator(mockSpec);
  });

  describe("initialization", () => {
    it("should initialize with default config", () => {
      expect(generator).toBeDefined();
    });

    it("should accept custom config", () => {
      const customConfig = {
        baseUrl: "/api/v1",
        errorRate: 0.1,
        dataSetSize: { min: 5, max: 25 },
      };

      const customGenerator = new TemplateMockGenerator(mockSpec, customConfig);
      expect(customGenerator).toBeDefined();
    });
  });

  describe("generateMockHandlers", () => {
    it("should generate mock handlers", () => {
      const result = generator.generateMockHandlers();

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("Test API");
    });
  });

  describe("operation context building", () => {
    it("should identify list operations correctly", () => {
      const context = generator["buildTemplateContext"]();
      const listOp = context.operations.find(
        (op) => op.path === "/users" && op.method === "get",
      );

      expect(listOp).toBeDefined();
      expect(listOp?.isListOperation).toBe(true);
      expect(listOp?.isSingleOperation).toBe(false);
      expect(listOp?.isCreateOperation).toBe(false);
    });

    it("should identify single operations correctly", () => {
      const context = generator["buildTemplateContext"]();
      const singleOp = context.operations.find(
        (op) => op.path === "/users/{id}" && op.method === "get",
      );

      expect(singleOp).toBeDefined();
      expect(singleOp?.isListOperation).toBe(false);
      expect(singleOp?.isSingleOperation).toBe(true);
      expect(singleOp?.hasPathParams).toBe(true);
      expect(singleOp?.pathParam).toBe("id");
    });

    it("should identify create operations correctly", () => {
      const context = generator["buildTemplateContext"]();
      const createOp = context.operations.find(
        (op) => op.path === "/users" && op.method === "post",
      );

      expect(createOp).toBeDefined();
      expect(createOp?.isCreateOperation).toBe(true);
      expect(createOp?.hasBody).toBe(true);
    });

    it("should identify update operations correctly", () => {
      const context = generator["buildTemplateContext"]();
      const updateOp = context.operations.find(
        (op) => op.path === "/users/{id}" && op.method === "patch",
      );

      expect(updateOp).toBeDefined();
      expect(updateOp?.isUpdateOperation).toBe(true);
      expect(updateOp?.hasBody).toBe(true);
      expect(updateOp?.hasPathParams).toBe(true);
    });

    it("should identify delete operations correctly", () => {
      const context = generator["buildTemplateContext"]();
      const deleteOp = context.operations.find(
        (op) => op.path === "/users/{id}" && op.method === "delete",
      );

      expect(deleteOp).toBeDefined();
      expect(deleteOp?.isDeleteOperation).toBe(true);
      expect(deleteOp?.hasPathParams).toBe(true);
    });
  });

  describe("query parameter processing", () => {
    it("should extract query parameters correctly", () => {
      const context = generator["buildTemplateContext"]();
      const listOp = context.operations.find(
        (op) => op.path === "/users" && op.method === "get",
      );

      expect(listOp?.queryParams).toHaveLength(2);
      expect(listOp?.queryParams[0].name).toBe("page");
      expect(listOp?.queryParams[0].isNumber).toBe(true);
      expect(listOp?.queryParams[1].name).toBe("search");
      expect(listOp?.queryParams[1].isNumber).toBe(false);
    });

    it("should detect pagination parameters", () => {
      const context = generator["buildTemplateContext"]();
      const listOp = context.operations.find(
        (op) => op.path === "/users" && op.method === "get",
      );

      expect(listOp?.hasPagination).toBe(true);
    });

    it("should detect search parameters", () => {
      const context = generator["buildTemplateContext"]();
      const listOp = context.operations.find(
        (op) => op.path === "/users" && op.method === "get",
      );

      expect(listOp?.hasSearch).toBe(true);
    });
  });

  describe("schema context building", () => {
    it("should build schema contexts correctly", () => {
      const context = generator["buildTemplateContext"]();

      expect(context.schemas).toHaveLength(2);

      const userSchema = context.schemas.find((s) => s.name === "User");
      expect(userSchema).toBeDefined();
      expect(userSchema?.lowerName).toBe("user");
      expect(userSchema?.primaryKey).toBe("id");
      expect(userSchema?.properties).toHaveLength(6);
    });

    it("should preserve property information", () => {
      const context = generator["buildTemplateContext"]();
      const userSchema = context.schemas.find((s) => s.name === "User");

      const emailProp = userSchema?.properties.find((p) => p.name === "email");
      expect(emailProp).toBeDefined();
      expect(emailProp?.type).toBe("string");
      // Check that the property has the expected structure
      expect(emailProp?.fakerMethod).toContain("email");
    });
  });

  describe("x-mock extensions", () => {
    it("should handle x-mock-filter extensions", () => {
      const specWithFilter = {
        ...mockSpec,
        paths: {
          "/users": {
            get: {
              parameters: [
                {
                  name: "status",
                  in: "query",
                  schema: { type: "string" },
                  "x-mock-filter": {
                    field: "isActive",
                    strategy: "boolean-inverse",
                  },
                },
              ],
            },
          },
        },
      };

      const filterGenerator = new TemplateMockGenerator(specWithFilter);
      const context = filterGenerator["buildTemplateContext"]();
      const listOp = context.operations.find((op) => op.method === "get");

      expect(listOp?.filters).toHaveLength(1);
      expect(listOp?.filters[0].name).toBe("status");
      expect(listOp?.filters[0].field).toBe("isActive");
      expect(listOp?.filters[0].config?.strategy).toBe("boolean-inverse");
    });

    it("should handle x-mock-response discrimination", () => {
      const specWithDiscriminator = {
        ...mockSpec,
        paths: {
          "/users": {
            get: {
              "x-mock-response": {
                case: "format",
                when: { summary: "UserSummary", detailed: "UserDetailed" },
                default: "User",
              },
            },
          },
        },
      };

      const discriminatorGenerator = new TemplateMockGenerator(
        specWithDiscriminator,
      );
      const context = discriminatorGenerator["buildTemplateContext"]();
      const listOp = context.operations.find((op) => op.method === "get");

      expect(listOp?.discriminator).toBeDefined();
      expect(listOp?.discriminator?.case).toBe("format");
      expect(listOp?.discriminator?.when).toEqual({
        summary: "UserSummary",
        detailed: "UserDetailed",
      });
    });
  });

  describe("entity extraction", () => {
    it("should extract entity information from paths", () => {
      const entityInfo = generator["extractEntityInfo"]("/users");
      expect(entityInfo?.entityName).toBe("User");
      expect(entityInfo?.entityPlural).toBe("users");
    });

    it("should handle paths with parameters", () => {
      const entityInfo = generator["extractEntityInfo"]("/users/{id}");
      expect(entityInfo?.entityName).toBe("User");
      expect(entityInfo?.pathParam).toBe("id");
    });

    it("should handle nested paths", () => {
      const entityInfo = generator["extractEntityInfo"]("/api/v1/users");
      // The extractEntityInfo picks the last non-parameter segment
      expect(entityInfo?.entityName).toBe("User");
      expect(entityInfo?.entityPlural).toBe("users");
    });
  });
});
