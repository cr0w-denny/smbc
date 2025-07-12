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
    // Resolve $ref if present
    const resolvedSchema = this.resolveReference(schema);
    
    const semanticType = this.detectSemanticType(name, resolvedSchema);

    // Check for x-mock-data extension first
    let fakerMethod: string;
    if (resolvedSchema["x-mock-data"]) {
      fakerMethod = this.generateFakerMethodFromExtension(
        resolvedSchema["x-mock-data"],
        resolvedSchema,
      );
    } else {
      // Pass both original and resolved schema to handle $ref cases
      fakerMethod = this.mapToFakerMethod(semanticType, resolvedSchema, schema);
    }

    const constraints = this.extractPropertyConstraints(resolvedSchema);

    return {
      name,
      type: resolvedSchema.type || "unknown",
      format: resolvedSchema.format,
      isRequired,
      constraints,
      semanticType,
      fakerMethod,
      example: resolvedSchema.example,
    };
  }

  private resolveReference(schema: any): any {
    // If it's not a reference, return as-is
    if (!schema.$ref) {
      return schema;
    }

    // Parse the reference path (e.g., "#/components/schemas/User")
    const refPath = schema.$ref;
    if (!refPath.startsWith("#/")) {
      // External references not supported, return original schema
      return schema;
    }

    // Split the path and navigate through the spec
    const pathParts = refPath.slice(2).split("/"); // Remove "#/" prefix
    let current = this.spec;
    
    for (const part of pathParts) {
      if (!current || typeof current !== "object" || !(part in current)) {
        // Reference not found, return original schema
        return schema;
      }
      current = current[part];
    }

    // Return the resolved schema, but also check if it has nested refs
    return this.resolveReference(current);
  }

  private detectSemanticType(name: string, schema: any): SemanticType {
    const lowerName = name.toLowerCase();
    // Normalize kebab-case and snake_case to a common format for matching
    const normalizedName = lowerName.replace(/[-_]/g, '');

    // Skip semantic detection for property names that start with numbers or special characters
    // These are likely to be invalid JavaScript identifiers that got quoted
    if (/^[^a-zA-Z]/.test(lowerName)) {
      return "generic";
    }

    // Format-based detection takes precedence
    if (schema.format === "uuid") return "uuid";
    if (schema.format === "email") return "email";
    if (schema.format === "date-time" || schema.format === "date")
      return "timestamp";
    if (schema.format === "uri") return "url";

    // ID patterns
    if (lowerName === "id" || lowerName.endsWith("id") || lowerName.endsWith("-id") || lowerName.endsWith("_id")) return "id";
    if (lowerName === "uuid") return "uuid";

    // Name patterns - check both original and normalized versions
    if (normalizedName.includes("firstname") || lowerName === "firstname" || lowerName === "first-name" || lowerName === "first_name")
      return "firstName";
    if (normalizedName.includes("lastname") || lowerName === "lastname" || lowerName === "last-name" || lowerName === "last_name")
      return "lastName";
    if (normalizedName.includes("fullname") || lowerName === "name" || lowerName === "full-name" || lowerName === "full_name")
      return "fullName";

    // Contact patterns
    if (lowerName.includes("email") || schema.format === "email")
      return "email";
    if (lowerName.includes("phone") || lowerName.includes("tel"))
      return "phone";
    if (lowerName.includes("username") || lowerName === "login" || lowerName === "user-name" || lowerName === "user_name")
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
    // Check for count-specific patterns first before general "total"
    if (lowerName.includes("amount") || (lowerName.includes("total") && !lowerName.includes("count")))
      return "amount";
    if (lowerName.includes("percent") || lowerName.includes("rate"))
      return "percentage";

    // Content
    if (lowerName.includes("title") || lowerName.includes("subject"))
      return "title";
    if (lowerName.includes("description") || lowerName.includes("desc") || lowerName === "bio")
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

    // Timestamps - check normalized name for patterns
    if (normalizedName.includes("createdat") || lowerName === "created-at" || lowerName === "created_at")
      return "createdAt";
    if (normalizedName.includes("updatedat") || lowerName === "updated-at" || lowerName === "updated_at")
      return "updatedAt";
    if (normalizedName.includes("deletedat") || lowerName === "deleted-at" || lowerName === "deleted_at")
      return "deletedAt";
    if (lowerName.includes("timestamp") || schema.format === "date-time")
      return "timestamp";

    // Booleans - check normalized name
    if (normalizedName.includes("isactive") || lowerName.includes("active") || lowerName === "is-active")
      return "isActive";
    if (normalizedName.includes("isenabled") || lowerName.includes("enabled") || lowerName === "is-enabled")
      return "isEnabled";
    if (normalizedName.includes("ispublic") || lowerName.includes("public") || lowerName === "is-public")
      return "isPublic";
    if (schema.type === "boolean") return "flag";

    // Numbers - check all variations
    if (normalizedName.includes("count") || lowerName.includes("count") || lowerName.endsWith("-count") || lowerName.endsWith("_count") || lowerName === "total-count") return "count";
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

  private mapToFakerMethod(semanticType: SemanticType, schema: any, originalSchema?: any): string {
    switch (semanticType) {
      case "id":
        return "faker.number.int({ min: 1, max: 100000 })";
      case "uuid":
        return "faker.string.uuid()";
      case "email":
        return "faker.internet.email()";
      case "username":
        return "faker.internet.userName()";
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
        if (schema.type === "array") {
          // Handle arrays - check if items have a $ref
          if (schema.items && schema.items.$ref) {
            const resolvedItems = this.resolveReference(schema.items);
            const itemType = this.getSchemaNameFromRef(schema.items.$ref);
            if (itemType) {
              return `Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => generate${itemType}())`;
            }
          }
          // Default array handling
          return "Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.lorem.word())";
        }
        if (schema.type === "object" || (!schema.type && (schema.$ref || originalSchema?.$ref))) {
          // Handle object references - check original schema first for $ref
          const ref = originalSchema?.$ref || schema.$ref;
          const refName = this.getSchemaNameFromRef(ref);
          if (refName) {
            return `generate${refName}()`;
          }
          return "{}";
        }
        if (schema.type === "string") return "faker.lorem.word()";
        if (schema.type === "number") return "faker.number.float()";
        if (schema.type === "integer") return "faker.number.int({ min: 1, max: 100000 })";
        if (schema.type === "boolean") return "faker.datatype.boolean()";
        return "faker.lorem.word()";
    }
  }

  private getSchemaNameFromRef(ref: string): string | null {
    if (!ref || !ref.startsWith("#/components/schemas/")) {
      return null;
    }
    return ref.split("/").pop() || null;
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
