import Handlebars from "handlebars";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface TemplateContext {
  apiName: string;
  timestamp: string;
  baseUrl: string;
  delay: { min: number; max: number };
  errorRate: number;
  dataSetSize: { min: number; max: number };
  usesDateFormatting: boolean;
  schemas: SchemaContext[];
  operations: OperationContext[];
}

export interface SchemaContext {
  name: string;
  lowerName: string;
  primaryKey?: string;
  properties: PropertyContext[];
  hasDiscriminatedResponses: boolean;
  discriminatedSchemas?: DiscriminatedSchemaContext[];
}

export interface PropertyContext {
  name: string;
  type: string;
  fakerMethod: string;
  isRequired: boolean;
}

export interface DiscriminatedSchemaContext {
  name: string;
  mapping: FieldMappingContext[];
}

export interface FieldMappingContext {
  source: string;
  target: string;
  transform?: string;
}

export interface OperationContext {
  method: string;
  path: string;
  mswPath: string;
  description: string;
  entityName: string;
  entityPlural: string;
  lowerEntityName: string;
  primaryKey: string;
  pathParam?: string;

  // Operation type flags
  isListOperation: boolean;
  isSingleOperation: boolean;
  isCreateOperation: boolean;
  isUpdateOperation: boolean;
  isDeleteOperation: boolean;

  // Parameter handling
  hasParams: boolean;
  hasBody: boolean;
  hasPathParams: boolean;
  queryParams: QueryParamContext[];

  // List operation specific
  hasSearch: boolean;
  searchConfig?: SearchConfig;
  hasPagination: boolean;
  hasSorting: boolean;
  filters: FilterContext[];

  // Error handling
  errorScenarios: boolean;
  defaultError: ErrorContext;

  // Response discrimination
  discriminator?: DiscriminatorContext;
}

export interface QueryParamContext {
  name: string;
  type: string;
  isNumber: boolean;
  defaultValue?: string;
}

export interface SearchConfig {
  fields?: string[];
}

export interface FilterContext {
  name: string;
  field: string;
  isBooleanField: boolean;
  config?: {
    strategy: "exact" | "partial-match" | "boolean-choice";
    field: string;
  };
}

export interface ErrorContext {
  type: string;
  message: string;
  status: number;
}

export interface DiscriminatorContext {
  case: string;
  when: Record<string, string>;
  default: string;
}

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templatesDir: string;

  constructor() {
    this.handlebars = Handlebars.create();
    this.templatesDir = join(
      dirname(fileURLToPath(import.meta.url)),
      "templates",
    );
    this.registerHelpers();
    this.loadPartials();
  }

  private registerHelpers() {
    // Helper for JSON stringification
    this.handlebars.registerHelper("json", (context) => {
      return JSON.stringify(context);
    });

    // Helper for equality comparison
    this.handlebars.registerHelper("eq", (a, b) => {
      return a === b;
    });

    // Helper for conditional rendering
    this.handlebars.registerHelper("unless", function (conditional, options) {
      if (!conditional) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for capitalizing strings
    this.handlebars.registerHelper("capitalize", (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper for lowercasing strings
    this.handlebars.registerHelper("lower", (str: string) => {
      return str.toLowerCase();
    });

    // Note: Removed entityName helper to avoid conflicts with template variables

    // Helper for collection names
    this.handlebars.registerHelper("collectionName", (str: string) => {
      return str + "s";
    });

    // Helper for camelCase conversion
    this.handlebars.registerHelper("camelCase", (str: string) => {
      return str.charAt(0).toLowerCase() + str.slice(1);
    });

    // Helper for quoting property names that need it (e.g., kebab-case)
    this.handlebars.registerHelper("quoteProp", (str: string) => {
      // Check if the property name needs quotes
      // - Contains hyphens (kebab-case)
      // - Starts with a number
      // - Is a reserved word
      // - Contains special characters
      const reserved = new Set([
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
        'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
        'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
        'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield', 'let', 'static',
        'enum', 'implements', 'interface', 'package', 'private', 'protected',
        'public', 'await', 'async'
      ]);
      
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str) && !reserved.has(str)) {
        return str;
      }
      return JSON.stringify(str);
    });
  }

  private loadPartials() {
    const partialsDir = join(this.templatesDir, "partials");

    try {
      const partialFiles = readdirSync(partialsDir);

      for (const file of partialFiles) {
        if (file.endsWith(".hbs")) {
          const partialName = file.replace(".hbs", "");
          const partialPath = join(partialsDir, file);
          const partialContent = readFileSync(partialPath, "utf-8");
          this.handlebars.registerPartial(partialName, partialContent);
        }
      }
    } catch (error) {}
  }

  public loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    const templatePath = join(this.templatesDir, `${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, "utf-8");
    return this.handlebars.compile(templateContent);
  }

  public render(templateName: string, context: TemplateContext): string {
    const template = this.loadTemplate(templateName);
    return template(context);
  }

  public renderPartial(partialName: string, context: any): string {
    const partial = this.handlebars.partials[partialName];
    if (!partial) {
      throw new Error(`Partial '${partialName}' not found`);
    }

    if (typeof partial === "string") {
      const compiledPartial = this.handlebars.compile(partial);
      return compiledPartial(context);
    }

    return partial(context);
  }
}
