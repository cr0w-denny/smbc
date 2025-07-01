// Enhanced schema analysis for better mock generation

export interface SchemaAnalysis {
  entityName: string;
  properties: PropertyAnalysis[];
  relationships: Relationship[];
  constraints: Constraint[];
  patterns: SemanticPattern[];
}

export interface PropertyAnalysis {
  name: string;
  type: string;
  format?: string;
  isRequired: boolean;
  constraints: Constraint[];
  semanticType: SemanticType;
  fakerMethod: string;
  example?: any;
}

export interface Relationship {
  type: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
  targetEntity: string;
  foreignKey: string;
}

export interface Constraint {
  type:
    | "pattern"
    | "enum"
    | "min"
    | "max"
    | "minLength"
    | "maxLength"
    | "format";
  value: any;
}

export interface SemanticPattern {
  type:
    | "timestamp"
    | "identifier"
    | "name"
    | "contact"
    | "address"
    | "financial"
    | "status"
    | "content";
  confidence: number;
}

export type SemanticType =
  | "id"
  | "uuid"
  | "email"
  | "username"
  | "firstName"
  | "lastName"
  | "fullName"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "country"
  | "zipCode"
  | "url"
  | "image"
  | "avatar"
  | "website"
  | "price"
  | "currency"
  | "amount"
  | "percentage"
  | "title"
  | "description"
  | "content"
  | "summary"
  | "status"
  | "category"
  | "tag"
  | "priority"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "timestamp"
  | "isActive"
  | "isEnabled"
  | "isPublic"
  | "flag"
  | "count"
  | "quantity"
  | "rating"
  | "score"
  | "generic";

export class SchemaAnalyzer {
  private spec: any;
  private schemas: Record<string, any>;

  constructor(spec: any) {
    this.spec = spec;
    this.schemas = spec.components?.schemas || {};
  }

  analyzeSchema(schemaName: string): SchemaAnalysis | null {
    const schema = this.schemas[schemaName];
    if (!schema) {
      return null;
    }

    const properties = this.analyzeProperties(schema, schemaName);
    const relationships = this.detectRelationships(properties, schemaName);
    const constraints = this.extractConstraints(schema);
    const patterns = this.detectSemanticPatterns(properties);

    return {
      entityName: schemaName,
      properties,
      relationships,
      constraints,
      patterns,
    };
  }

  private analyzeProperties(
    schema: any,
    schemaName: string,
  ): PropertyAnalysis[] {
    const properties: PropertyAnalysis[] = [];
    const requiredFields = schema.required || [];

    for (const [propName, propSchema] of Object.entries(
      schema.properties || {},
    )) {
      const analysis = this.analyzeProperty(
        propName,
        propSchema as any,
        requiredFields.includes(propName),
      );
      properties.push(analysis);
    }

    return properties;
  }

  private analyzeProperty(
    name: string,
    schema: any,
    isRequired: boolean,
  ): PropertyAnalysis {
    const semanticType = this.detectSemanticType(name, schema);

    // Check for x-mock-data extension first
    let fakerMethod: string;
    if (schema["x-mock-data"]) {
      fakerMethod = this.generateFakerMethodFromExtension(
        schema["x-mock-data"],
        schema,
      );
    } else {
      fakerMethod = this.mapToFakerMethod(semanticType, schema);
    }

    const constraints = this.extractPropertyConstraints(schema);

    return {
      name,
      type: schema.type || "unknown",
      format: schema.format,
      isRequired,
      constraints,
      semanticType,
      fakerMethod,
      example: schema.example,
    };
  }

  private detectSemanticType(name: string, schema: any): SemanticType {
    const lowerName = name.toLowerCase();

    // Format-based detection takes precedence
    if (schema.format === "uuid") return "uuid";
    if (schema.format === "email") return "email";
    if (schema.format === "date-time" || schema.format === "date")
      return "timestamp";
    if (schema.format === "uri") return "url";

    // ID patterns
    if (lowerName === "id" || lowerName.endsWith("id")) return "id";
    if (lowerName === "uuid") return "uuid";

    // Name patterns
    if (lowerName.includes("firstname") || lowerName.includes("first_name"))
      return "firstName";
    if (lowerName.includes("lastname") || lowerName.includes("last_name"))
      return "lastName";
    if (lowerName.includes("fullname") || lowerName === "name")
      return "fullName";

    // Contact patterns
    if (lowerName.includes("email") || schema.format === "email")
      return "email";
    if (lowerName.includes("phone") || lowerName.includes("tel"))
      return "phone";
    if (lowerName.includes("username") || lowerName === "login")
      return "username";

    // Address patterns
    if (lowerName.includes("address")) return "address";
    if (lowerName.includes("city")) return "city";
    if (lowerName.includes("state") || lowerName.includes("province"))
      return "state";
    if (lowerName.includes("country")) return "country";
    if (lowerName.includes("zip") || lowerName.includes("postal"))
      return "zipCode";

    // URLs and media
    if (
      lowerName.includes("url") ||
      lowerName.includes("link") ||
      schema.format === "uri"
    )
      return "url";
    if (
      lowerName.includes("image") ||
      lowerName.includes("photo") ||
      lowerName.includes("picture")
    )
      return "image";
    if (lowerName.includes("avatar")) return "avatar";
    if (lowerName.includes("website") || lowerName.includes("homepage"))
      return "url";

    // Financial
    if (lowerName.includes("price") || lowerName.includes("cost"))
      return "price";
    if (lowerName.includes("currency")) return "currency";
    if (lowerName.includes("amount") || lowerName.includes("total"))
      return "amount";
    if (lowerName.includes("percent") || lowerName.includes("rate"))
      return "percentage";

    // Content
    if (lowerName.includes("title") || lowerName.includes("subject"))
      return "title";
    if (lowerName.includes("description") || lowerName.includes("desc"))
      return "description";
    if (lowerName.includes("content") || lowerName.includes("body"))
      return "content";
    if (lowerName.includes("summary")) return "summary";

    // Status and categories
    if (lowerName.includes("status")) return "status";
    if (lowerName.includes("category") || lowerName.includes("type"))
      return "category";
    if (lowerName.includes("tag")) return "tag";
    if (lowerName.includes("priority")) return "priority";

    // Timestamps
    if (lowerName.includes("createdat") || lowerName.includes("created_at"))
      return "createdAt";
    if (lowerName.includes("updatedat") || lowerName.includes("updated_at"))
      return "updatedAt";
    if (lowerName.includes("deletedat") || lowerName.includes("deleted_at"))
      return "deletedAt";
    if (lowerName.includes("timestamp") || schema.format === "date-time")
      return "timestamp";

    // Booleans
    if (lowerName.includes("isactive") || lowerName.includes("active"))
      return "isActive";
    if (lowerName.includes("isenabled") || lowerName.includes("enabled"))
      return "isEnabled";
    if (lowerName.includes("ispublic") || lowerName.includes("public"))
      return "isPublic";
    if (schema.type === "boolean") return "flag";

    // Numbers
    if (lowerName.includes("count")) return "count";
    if (lowerName.includes("quantity") || lowerName.includes("qty"))
      return "quantity";
    if (lowerName.includes("rating") || lowerName.includes("score"))
      return "score";

    return "generic";
  }

  private generateFakerMethodFromExtension(mockData: any, schema: any): string {
    // Handle boolean with weight first (before general faker method)
    if (schema.type === "boolean" && mockData.weight !== undefined) {
      return `faker.datatype.boolean({ probability: ${mockData.weight} })`;
    }

    // Handle direct faker method
    if (mockData.faker) {
      // Parse the faker method path (e.g., "person.firstName")
      const parts = mockData.faker.split(".");
      let fakerCall = "faker";
      for (const part of parts) {
        fakerCall += `.${part}`;
      }
      fakerCall += "()";

      // Add unique constraint if specified
      if (mockData.unique) {
        return `faker.helpers.unique(() => ${fakerCall})`;
      }

      return fakerCall;
    }

    // Handle numeric ranges
    if (schema.type === "integer" || schema.type === "number") {
      const min = mockData.min ?? schema.minimum ?? 0;
      const max = mockData.max ?? schema.maximum ?? 100;

      if (schema.type === "integer") {
        return `faker.number.int({ min: ${min}, max: ${max} })`;
      } else {
        const fractionDigits = mockData.fractionDigits ?? 2;
        return `faker.number.float({ min: ${min}, max: ${max}, fractionDigits: ${fractionDigits} })`;
      }
    }

    // Handle patterns
    if (mockData.pattern) {
      return `faker.helpers.fromRegExp('${mockData.pattern}')`;
    }

    // Handle examples array
    if (mockData.examples && Array.isArray(mockData.examples)) {
      const examples = mockData.examples.map((e: any) => `"${e}"`).join(", ");
      return `faker.helpers.arrayElement([${examples}])`;
    }

    // Handle date formatting
    if (schema.format === "date-time" || schema.format === "date") {
      // Handle relative dates
      if (mockData.relative) {
        // Parse relative date string like "-30d to now" or "-7d to now"
        const match = mockData.relative.match(/^-(\d+)d\s+to\s+now$/);
        if (match) {
          const days = parseInt(match[1], 10);
          const baseCall = `faker.date.recent({ days: ${days} })`;

          // Apply custom format if specified
          if (mockData.format) {
            return `format(${baseCall}, '${mockData.format}')`;
          }

          return `${baseCall}.toISOString()`;
        }
        // Default fallback for relative
        const baseCall = `faker.date.recent({ days: 30 })`;
        if (mockData.format) {
          return `format(${baseCall}, '${mockData.format}')`;
        }
        return `${baseCall}.toISOString()`;
      }

      // Handle custom format without relative date
      if (mockData.format) {
        return `format(faker.date.recent({ days: 30 }), '${mockData.format}')`;
      }

      // Default date handling
      return `faker.date.recent({ days: 30 }).toISOString()`;
    }

    // Handle image dimensions
    if (mockData.dimensions && mockData.faker?.includes("image")) {
      const { width, height } = mockData.dimensions;
      return `faker.image.url({ width: ${width}, height: ${height} })`;
    }

    // Fallback to semantic detection
    return this.mapToFakerMethod(
      this.detectSemanticType(schema.title || "generic", schema),
      schema,
    );
  }

  private mapToFakerMethod(semanticType: SemanticType, schema: any): string {
    switch (semanticType) {
      case "id":
        return "faker.number.int({ min: 1, max: 100000 })";
      case "uuid":
        return "faker.string.uuid()";
      case "email":
        return "faker.internet.email()";
      case "username":
        return "faker.internet.username()";
      case "firstName":
        return "faker.person.firstName()";
      case "lastName":
        return "faker.person.lastName()";
      case "fullName":
        return "faker.person.fullName()";
      case "phone":
        return "faker.phone.number()";
      case "address":
        return "faker.location.streetAddress()";
      case "city":
        return "faker.location.city()";
      case "state":
        return "faker.location.state()";
      case "country":
        return "faker.location.country()";
      case "zipCode":
        return "faker.location.zipCode()";
      case "url":
        return "faker.internet.url()";
      case "image":
        return "faker.image.url()";
      case "avatar":
        return "faker.image.avatar()";
      case "website":
        return "faker.internet.url()";
      case "price":
        return "parseFloat(faker.commerce.price())";
      case "currency":
        return "faker.finance.currencyCode()";
      case "amount":
        return "faker.number.float({ min: 0, max: 10000, fractionDigits: 2 })";
      case "percentage":
        return "faker.number.float({ min: 0, max: 100, fractionDigits: 2 })";
      case "title":
        return "faker.lorem.sentence()";
      case "description":
        return "faker.lorem.paragraph()";
      case "content":
        return "faker.lorem.paragraphs()";
      case "summary":
        return "faker.lorem.sentence()";
      case "status":
        return 'faker.helpers.arrayElement(["active", "inactive", "pending"])';
      case "category":
        return "faker.commerce.department()";
      case "tag":
        return "faker.lorem.word()";
      case "priority":
        return 'faker.helpers.arrayElement(["low", "medium", "high"])';
      case "createdAt":
      case "updatedAt":
      case "deletedAt":
      case "timestamp":
        return "faker.date.recent().toISOString()";
      case "isActive":
      case "isEnabled":
      case "isPublic":
      case "flag":
        return "faker.datatype.boolean()";
      case "count":
      case "quantity":
        return "faker.number.int({ min: 0, max: 100 })";
      case "rating":
      case "score":
        return "faker.number.float({ min: 0, max: 5, fractionDigits: 1 })";
      default:
        if (schema.type === "string") return "faker.lorem.word()";
        if (schema.type === "number") return "faker.number.float()";
        if (schema.type === "integer") return "faker.number.int()";
        if (schema.type === "boolean") return "faker.datatype.boolean()";
        return "faker.lorem.word()";
    }
  }

  private detectRelationships(
    properties: PropertyAnalysis[],
    schemaName: string,
  ): Relationship[] {
    const relationships: Relationship[] = [];

    for (const prop of properties) {
      if (
        prop.name.toLowerCase().endsWith("id") &&
        prop.name.toLowerCase() !== "id"
      ) {
        const baseName = prop.name.slice(0, -2);
        const targetEntity = this.capitalize(baseName);

        if (this.schemas[targetEntity]) {
          relationships.push({
            type: "manyToOne",
            targetEntity,
            foreignKey: prop.name,
          });
        }
      }
    }

    return relationships;
  }

  private extractConstraints(schema: any): Constraint[] {
    const constraints: Constraint[] = [];

    if (schema.pattern)
      constraints.push({ type: "pattern", value: schema.pattern });
    if (schema.enum) constraints.push({ type: "enum", value: schema.enum });
    if (schema.minimum !== undefined)
      constraints.push({ type: "min", value: schema.minimum });
    if (schema.maximum !== undefined)
      constraints.push({ type: "max", value: schema.maximum });
    if (schema.minLength !== undefined)
      constraints.push({ type: "minLength", value: schema.minLength });
    if (schema.maxLength !== undefined)
      constraints.push({ type: "maxLength", value: schema.maxLength });
    if (schema.format)
      constraints.push({ type: "format", value: schema.format });

    return constraints;
  }

  private extractPropertyConstraints(schema: any): Constraint[] {
    return this.extractConstraints(schema);
  }

  private detectSemanticPatterns(
    properties: PropertyAnalysis[],
  ): SemanticPattern[] {
    const patterns: SemanticPattern[] = [];

    // Detect common entity patterns
    const hasId = properties.some((p) => p.semanticType === "id");
    const hasTimestamps = properties.some(
      (p) => p.semanticType === "createdAt",
    );
    const hasStatus = properties.some((p) => p.semanticType === "status");

    if (hasId && hasTimestamps) {
      patterns.push({ type: "identifier", confidence: 0.9 });
    }

    if (hasStatus) {
      patterns.push({ type: "status", confidence: 0.8 });
    }

    return patterns;
  }

  public capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public singularize(str: string): string {
    // Simple singularization
    if (str.endsWith("ies")) return str.slice(0, -3) + "y";
    if (str.endsWith("es")) return str.slice(0, -2);
    if (str.endsWith("s")) return str.slice(0, -1);
    return str;
  }

  /**
   * Parse date format strings to JavaScript Intl.DateTimeFormat options
   */
}
