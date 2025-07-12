import { describe, it, expect } from "vitest";
import { TemplateMockGenerator } from "../template-generator";
import { SchemaAnalyzer } from "../schema-analyzer";

describe("Kebab-case property handling", () => {
  const specWithKebabCase = {
    openapi: "3.0.0",
    info: {
      title: "Kebab Case Test API",
      version: "1.0.0",
    },
    paths: {
      "/users": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["id", "first-name", "last-name", "is-active"],
          properties: {
            id: { type: "string" },
            "first-name": { type: "string" },
            "last-name": { type: "string" },
            "is-active": { type: "boolean" },
            "created-at": { type: "string", format: "date-time" },
          },
        },
        NestedModel: {
          type: "object",
          properties: {
            "user-info": {
              $ref: "#/components/schemas/User",
            },
            "meta-data": {
              type: "object",
              properties: {
                "last-modified": { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  };

  describe("SchemaAnalyzer", () => {
    it("should preserve kebab-case property names", () => {
      const analyzer = new SchemaAnalyzer(specWithKebabCase);
      const analysis = analyzer.analyzeSchema("User");

      expect(analysis).toBeDefined();
      expect(analysis?.properties).toHaveLength(5);

      const firstNameProp = analysis?.properties.find(
        (p) => p.name === "first-name"
      );
      expect(firstNameProp).toBeDefined();
      expect(firstNameProp?.name).toBe("first-name");
    });

    it("should detect semantic types even with kebab-case", () => {
      const analyzer = new SchemaAnalyzer(specWithKebabCase);
      const analysis = analyzer.analyzeSchema("User");

      const firstNameProp = analysis?.properties.find(
        (p) => p.name === "first-name"
      );
      expect(firstNameProp?.semanticType).toBe("firstName");
      expect(firstNameProp?.fakerMethod).toContain("person.firstName");
    });
  });

  describe("TemplateMockGenerator", () => {
    it("should generate valid JavaScript for kebab-case properties", () => {
      const generator = new TemplateMockGenerator(specWithKebabCase);
      const mockCode = generator.generateMockHandlers();

      // Check that kebab-case properties are quoted
      expect(mockCode).toContain('"first-name":');
      expect(mockCode).toContain('"last-name":');
      expect(mockCode).toContain('"is-active":');
      expect(mockCode).toContain('"created-at":');

      // Should not contain unquoted kebab-case properties
      expect(mockCode).not.toMatch(/^\s*first-name:/m);
      expect(mockCode).not.toMatch(/^\s*last-name:/m);
    });

    it("should handle $ref properties with kebab-case", () => {
      const generator = new TemplateMockGenerator(specWithKebabCase);
      const context = generator["buildTemplateContext"]();

      const nestedSchema = context.schemas.find(
        (s) => s.name === "NestedModel"
      );
      expect(nestedSchema).toBeDefined();

      const userInfoProp = nestedSchema?.properties.find(
        (p) => p.name === "user-info"
      );
      expect(userInfoProp).toBeDefined();
      expect(userInfoProp?.name).toBe("user-info");
    });
  });

  describe("Integration", () => {
    it("should generate compilable TypeScript code", () => {
      const generator = new TemplateMockGenerator(specWithKebabCase);
      const mockCode = generator.generateMockHandlers();

      // Basic TypeScript syntax validation
      expect(() => {
        // Check for common syntax errors
        const hasValidObjectLiterals = !mockCode.match(
          /{\s*[a-z-]+\s*:/g
        ) || mockCode.match(/{\s*"[a-z-]+"\s*:/g);
        if (!hasValidObjectLiterals) {
          throw new Error("Invalid object literal syntax");
        }
      }).not.toThrow();
    });
  });
});