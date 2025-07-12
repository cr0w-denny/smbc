import { describe, it, expect } from "vitest";
import { SchemaAnalyzer } from "../schema-analyzer";

describe("$ref property handling", () => {
  const specWithRefs = {
    openapi: "3.0.0",
    info: {
      title: "Ref Test API",
      version: "1.0.0",
    },
    components: {
      schemas: {
        Address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            zipCode: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            address: {
              $ref: "#/components/schemas/Address",
            },
            "home-address": {
              $ref: "#/components/schemas/Address",
            },
          },
        },
        PagedResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/User",
              },
            },
            total: { type: "integer" },
          },
        },
      },
    },
  };

  it("should handle $ref properties", () => {
    const analyzer = new SchemaAnalyzer(specWithRefs);
    const analysis = analyzer.analyzeSchema("User");

    expect(analysis).toBeDefined();
    const addressProp = analysis?.properties.find((p) => p.name === "address");
    expect(addressProp).toBeDefined();
    
    // Check how $ref is handled - likely returns generic type
    expect(addressProp?.type).toBeDefined();
  });

  it("should handle kebab-case properties with $ref", () => {
    const analyzer = new SchemaAnalyzer(specWithRefs);
    const analysis = analyzer.analyzeSchema("User");

    const homeAddressProp = analysis?.properties.find(
      (p) => p.name === "home-address"
    );
    expect(homeAddressProp).toBeDefined();
    expect(homeAddressProp?.name).toBe("home-address");
  });

  it("should handle array items with $ref", () => {
    const analyzer = new SchemaAnalyzer(specWithRefs);
    const analysis = analyzer.analyzeSchema("PagedResponse");

    const itemsProp = analysis?.properties.find((p) => p.name === "items");
    expect(itemsProp).toBeDefined();
    expect(itemsProp?.type).toBe("array");
  });
});