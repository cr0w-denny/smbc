/**
 * Utilities for extracting and parsing OpenAPI parameters
 */

import { OpenAPIParameter } from "./types";
import type { FilterFieldConfig, FilterValues } from "../autofilter/types";

/**
 * Extract query parameters from an OpenAPI operation
 */
export function extractQueryParameters(operation: any): OpenAPIParameter[] {
  const parameters: OpenAPIParameter[] = [];

  // Try to extract from operation.parameters
  if (operation?.parameters) {
    for (const param of operation.parameters) {
      if (param.in === "query") {
        parameters.push(param);
      }
    }
  }

  // Try to extract from operation.requestBody if it's a GET with query params
  // (some OpenAPI specs define query params differently)

  return parameters;
}

/**
 * Extract parameters from TypeScript operation types
 * This works with the generated types from openapi-typescript
 */
export function extractFromOperationType(
  operationType: any,
): FilterFieldConfig[] {
  const fields: FilterFieldConfig[] = [];

  try {
    // Look for parameters.query in the operation type
    const queryParams = operationType?.parameters?.query;

    if (queryParams && typeof queryParams === "object") {
      Object.entries(queryParams).forEach(([name, schema]: [string, any]) => {
        const field = schemaToFieldConfig(name, schema);
        if (field) {
          fields.push(field);
        }
      });
    }
  } catch (error) {
    // Silently handle extraction errors
  }

  return fields;
}

/**
 * Convert an OpenAPI parameter schema to a FilterFieldConfig
 */
export function parameterToFieldConfig(
  param: OpenAPIParameter,
): FilterFieldConfig {
  const schema = param.schema;
  const name = param.name;

  return schemaToFieldConfig(name, schema, {
    required: param.required,
    description: param.description,
  });
}

/**
 * Convert a schema object to a FilterFieldConfig
 */
export function schemaToFieldConfig(
  name: string,
  schema: any,
  options: {
    required?: boolean;
    description?: string;
  } = {},
): FilterFieldConfig {
  const config: FilterFieldConfig = {
    name,
    label: generateLabel(name),
    type: "text",
    required: options.required || false,
    defaultValue: schema.default,
    placeholder:
      options.description || `Enter ${generateLabel(name).toLowerCase()}`,
  };

  // Determine field type based on schema
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        config.type = "select";
        config.options = schema.enum.map((value: string) => ({
          value,
          label: generateLabel(value),
        }));
      } else if (name.toLowerCase().includes("search")) {
        config.type = "search";
        config.debounceMs = 300;
        config.fullWidth = true;
      } else {
        config.type = "text";
      }
      break;

    case "integer":
    case "number":
      // Hide pagination fields by default
      if (name === "page" || name === "pageSize" || name.includes("limit")) {
        config.type = "hidden";
      } else {
        config.type = "number";
        config.min = schema.minimum;
        config.max = schema.maximum;
      }
      break;

    case "boolean":
      config.type = "checkbox";
      break;

    case "array":
      // For now, treat arrays as text input (comma-separated)
      config.type = "text";
      config.placeholder = "Enter comma-separated values";
      break;

    default:
      config.type = "text";
  }

  // Special handling for common field names
  if (name.toLowerCase().includes("sort")) {
    if (
      name.toLowerCase().includes("order") ||
      name.toLowerCase().includes("direction")
    ) {
      config.type = "select";
      config.options = [
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ];
    } else {
      // sortBy field - would need to be populated with available fields
      config.type = "select";
      config.options = []; // To be populated by the consuming component
    }
  }

  return config;
}

/**
 * Generate a human-readable label from a field name
 */
export function generateLabel(name: string): string {
  return (
    name
      // Handle camelCase and snake_case
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      // Capitalize first letter of each word
      .replace(/\b\w/g, (char) => char.toUpperCase())
      // Handle common abbreviations
      .replace(/\bId\b/g, "ID")
      .replace(/\bUrl\b/g, "URL")
      .replace(/\bApi\b/g, "API")
  );
}

/**
 * Create initial filter values from field configurations
 */
export function createInitialValues(fields: FilterFieldConfig[]): FilterValues {
  const values: FilterValues = {};

  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else {
      switch (field.type) {
        case "checkbox":
          values[field.name] = false;
          break;
        case "number":
          values[field.name] = undefined;
          break;
        default:
          values[field.name] = "";
      }
    }
  });

  return values;
}

/**
 * Validate filter values against field configurations
 */
export function validateFilterValues(
  values: FilterValues,
  fields: FilterFieldConfig[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = values[field.name];

    // Required field validation
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[field.name] = `${field.label} is required`;
      return;
    }

    // Type-specific validation
    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case "number": {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors[field.name] = `${field.label} must be a valid number`;
          } else {
            if (field.min !== undefined && numValue < field.min) {
              errors[field.name] =
                `${field.label} must be at least ${field.min}`;
            }
            if (field.max !== undefined && numValue > field.max) {
              errors[field.name] =
                `${field.label} must be at most ${field.max}`;
            }
          }
          break;
        }

        case "select":
          if (
            field.options &&
            !field.options.some((opt) => opt.value === value)
          ) {
            errors[field.name] =
              `${field.label} must be one of the available options`;
          }
          break;
      }
    }
  });

  return errors;
}

/**
 * Clean filter values by removing empty/undefined values
 */
export function cleanFilterValues(values: FilterValues): FilterValues {
  const cleaned: FilterValues = {};

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
}
