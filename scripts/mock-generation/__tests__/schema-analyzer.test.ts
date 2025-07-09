import { describe, it, expect, beforeEach } from "vitest";
import { SchemaAnalyzer } from "../schema-analyzer";

describe("SchemaAnalyzer", () => {
  let analyzer: SchemaAnalyzer;
  let mockSpec: any;

  beforeEach(() => {
    mockSpec = {
      openapi: "3.0.0",
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
              age: { type: "integer", minimum: 18, maximum: 100 },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              profileScore: { type: "number", minimum: 0, maximum: 100 },
              companyId: { type: "string", format: "uuid" },
              phoneNumber: { type: "string" },
              website: { type: "string", format: "uri" },
            },
          },
          Company: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              employees: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
              },
            },
          },
          Order: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              customerId: { type: "string", format: "uuid" },
              orderDate: { type: "string", format: "date" },
              totalAmount: { type: "number", minimum: 0 },
              status: {
                type: "string",
                enum: [
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ],
              },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
              },
            },
          },
          OrderItem: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              productId: { type: "string", format: "uuid" },
              quantity: { type: "integer", minimum: 1 },
              unitPrice: { type: "number", minimum: 0 },
              productName: { type: "string" },
            },
          },
        },
      },
    };

    analyzer = new SchemaAnalyzer(mockSpec);
  });

  describe("constructor", () => {
    it("should create analyzer with valid spec", () => {
      expect(analyzer).toBeInstanceOf(SchemaAnalyzer);
    });

    it("should handle spec without components", () => {
      const specWithoutComponents = { openapi: "3.0.0" };
      expect(() => new SchemaAnalyzer(specWithoutComponents)).not.toThrow();
    });

    it("should handle spec without schemas", () => {
      const specWithoutSchemas = { openapi: "3.0.0", components: {} };
      expect(() => new SchemaAnalyzer(specWithoutSchemas)).not.toThrow();
    });
  });

  describe("analyzeSchema", () => {
    it("should analyze User schema correctly", () => {
      const analysis = analyzer.analyzeSchema("User");

      expect(analysis?.entityName).toBe("User");
      expect(analysis?.properties).toHaveLength(11);
      expect(analysis?.patterns).toBeDefined();
      expect(analysis?.relationships).toBeDefined();
    });

    it("should return null for non-existent schema", () => {
      const analysis = analyzer.analyzeSchema("NonExistent");
      expect(analysis).toBeNull();
    });

    it("should detect semantic types correctly", () => {
      const analysis = analyzer.analyzeSchema("User");

      const emailProperty = analysis?.properties.find(
        (p) => p.name === "email",
      );
      expect(emailProperty?.semanticType).toBe("email");

      const idProperty = analysis?.properties.find((p) => p.name === "id");
      expect(idProperty?.semanticType).toBe("uuid");

      const firstNameProperty = analysis?.properties.find(
        (p) => p.name === "firstName",
      );
      expect(firstNameProperty?.semanticType).toBe("firstName");

      const createdAtProperty = analysis?.properties.find(
        (p) => p.name === "createdAt",
      );
      expect(createdAtProperty?.semanticType).toBe("timestamp");

      const phoneProperty = analysis?.properties.find(
        (p) => p.name === "phoneNumber",
      );
      expect(phoneProperty?.semanticType).toBe("phone");

      const websiteProperty = analysis?.properties.find(
        (p) => p.name === "website",
      );
      expect(websiteProperty?.semanticType).toBe("url");
    });

    it("should detect required fields", () => {
      const analysis = analyzer.analyzeSchema("User");

      const emailProperty = analysis?.properties.find(
        (p) => p.name === "email",
      );
      expect(emailProperty?.isRequired).toBe(true);

      const lastNameProperty = analysis?.properties.find(
        (p) => p.name === "lastName",
      );
      expect(lastNameProperty?.isRequired).toBe(false);
    });

    it("should detect constraints", () => {
      const analysis = analyzer.analyzeSchema("User");

      const ageProperty = analysis?.properties.find((p) => p.name === "age");
      expect(ageProperty?.constraints).toContainEqual({
        type: "min",
        value: 18,
      });
      expect(ageProperty?.constraints).toContainEqual({
        type: "max",
        value: 100,
      });

      const profileScoreProperty = analysis?.properties.find(
        (p) => p.name === "profileScore",
      );
      expect(profileScoreProperty?.constraints).toContainEqual({
        type: "min",
        value: 0,
      });
      expect(profileScoreProperty?.constraints).toContainEqual({
        type: "max",
        value: 100,
      });
    });

    it("should detect enum values", () => {
      const analysis = analyzer.analyzeSchema("Order");

      const statusProperty = analysis?.properties.find(
        (p) => p.name === "status",
      );
      expect(statusProperty?.constraints).toContainEqual({
        type: "enum",
        value: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      });
    });

    it("should detect foreign key relationships", () => {
      const analysis = analyzer.analyzeSchema("User");

      const companyIdProperty = analysis?.properties.find(
        (p) => p.name === "companyId",
      );
      expect(companyIdProperty?.semanticType).toBe("uuid");

      // Check if relationships are detected
      expect(analysis?.relationships).toBeDefined();
    });

    it("should detect semantic patterns", () => {
      const analysis = analyzer.analyzeSchema("User");

      // Check if patterns are detected
      expect(analysis?.patterns).toBeDefined();
      expect(Array.isArray(analysis?.patterns)).toBe(true);
    });
  });

  describe("semantic type detection", () => {
    const testCases = [
      { name: "id", expected: "id" },
      { name: "userId", expected: "id" },
      { name: "email", expected: "email" },
      { name: "firstName", expected: "firstName" },
      { name: "lastName", expected: "lastName" },
      { name: "fullName", expected: "fullName" },
      { name: "name", expected: "fullName" },
      { name: "title", expected: "title" },
      { name: "description", expected: "description" },
      { name: "createdAt", expected: "createdAt" },
      { name: "updatedAt", expected: "updatedAt" },
      { name: "phoneNumber", expected: "phone" },
      { name: "phone", expected: "phone" },
      { name: "address", expected: "address" },
      { name: "city", expected: "city" },
      { name: "country", expected: "country" },
      { name: "zipCode", expected: "zipCode" },
      { name: "price", expected: "price" },
      { name: "amount", expected: "amount" },
      { name: "cost", expected: "price" },
      { name: "website", expected: "url" },
      { name: "url", expected: "url" },
      { name: "avatar", expected: "avatar" },
      { name: "image", expected: "image" },
      { name: "companyName", expected: "generic" },
      { name: "company", expected: "generic" },
      { name: "randomField", expected: "generic" },
    ];

    testCases.forEach(({ name, expected }) => {
      it(`should detect ${name} as ${expected}`, () => {
        const testSpec = {
          openapi: "3.0.0",
          components: {
            schemas: {
              Test: {
                type: "object",
                properties: {
                  [name]: { type: "string" },
                },
              },
            },
          },
        };

        const testAnalyzer = new SchemaAnalyzer(testSpec);
        const analysis = testAnalyzer.analyzeSchema("Test");
        const property = analysis?.properties.find((p) => p.name === name);
        expect(property?.semanticType).toBe(expected);
      });
    });
  });

  describe("format-based detection", () => {
    const formatTestCases = [
      { format: "email", expected: "email" },
      { format: "uuid", expected: "uuid" },
      { format: "date-time", expected: "timestamp" },
      { format: "date", expected: "timestamp" },
      { format: "uri", expected: "url" },
    ];

    formatTestCases.forEach(({ format, expected }) => {
      it(`should detect format ${format} as ${expected}`, () => {
        const testSpec = {
          openapi: "3.0.0",
          components: {
            schemas: {
              Test: {
                type: "object",
                properties: {
                  testField: { type: "string", format },
                },
              },
            },
          },
        };

        const testAnalyzer = new SchemaAnalyzer(testSpec);
        const analysis = testAnalyzer.analyzeSchema("Test");
        const property = analysis?.properties.find(
          (p) => p.name === "testField",
        );
        expect(property?.semanticType).toBe(expected);
      });
    });
  });

  describe("error handling", () => {
    it("should handle empty schema", () => {
      const emptySpec = {
        openapi: "3.0.0",
        components: {
          schemas: {
            Empty: {},
          },
        },
      };

      const emptyAnalyzer = new SchemaAnalyzer(emptySpec);
      expect(() => {
        emptyAnalyzer.analyzeSchema("Empty");
      }).not.toThrow();
    });

    it("should handle schema without properties", () => {
      const noPropsSpec = {
        openapi: "3.0.0",
        components: {
          schemas: {
            NoProps: { type: "object" },
          },
        },
      };

      const noPropsAnalyzer = new SchemaAnalyzer(noPropsSpec);
      const analysis = noPropsAnalyzer.analyzeSchema("NoProps");
      expect(analysis?.properties).toEqual([]);
    });
  });
});
