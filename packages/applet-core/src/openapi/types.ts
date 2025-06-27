/**
 * Framework-agnostic types for OpenAPI and filter utilities
 */

// OpenAPI parameter schema types
export interface OpenAPIParameter {
  name: string;
  in: "query" | "path" | "header";
  required?: boolean;
  schema: {
    type: "string" | "integer" | "number" | "boolean" | "array";
    format?: string;
    enum?: string[];
    default?: any;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    description?: string;
  };
  description?: string;
}

// Configuration for filter behavior (framework-agnostic)
export interface AutoFilterConfig {
  /** Fields to include in the filter (defaults to all query parameters) */
  includeFields?: string[];
  /** Fields to exclude from the filter */
  excludeFields?: string[];
  /** Custom field configurations to override auto-generated ones */
  fieldOverrides?: Record<string, Partial<FilterFieldConfig>>;
  /** Layout configuration */
  layout?: {
    direction?: "row" | "column";
    spacing?: number;
    wrap?: boolean;
    maxFieldsPerRow?: number;
  };
  /** Show/hide common fields automatically */
  hidePagination?: boolean;
  hideSort?: boolean;
}

// Hook return type for parameter extraction
export interface UseAutoFilterParams {
  fields: FilterFieldConfig[];
  initialValues: FilterValues;
  errors: Record<string, string>;
}

// Re-import the filter types that are already in applet-core
import type { FilterFieldConfig, FilterValues } from "../autofilter/types";
