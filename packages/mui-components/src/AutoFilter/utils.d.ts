/**
 * Utilities for extracting and parsing OpenAPI parameters
 */
import { OpenAPIParameter, FilterFieldConfig, FilterValues } from './types';
/**
 * Extract query parameters from an OpenAPI operation
 */
export declare function extractQueryParameters(operation: any): OpenAPIParameter[];
/**
 * Extract parameters from TypeScript operation types
 * This works with the generated types from openapi-typescript
 */
export declare function extractFromOperationType(operationType: any): FilterFieldConfig[];
/**
 * Convert an OpenAPI parameter schema to a FilterFieldConfig
 */
export declare function parameterToFieldConfig(param: OpenAPIParameter): FilterFieldConfig;
/**
 * Convert a schema object to a FilterFieldConfig
 */
export declare function schemaToFieldConfig(name: string, schema: any, options?: {
    required?: boolean;
    description?: string;
}): FilterFieldConfig;
/**
 * Generate a human-readable label from a field name
 */
export declare function generateLabel(name: string): string;
/**
 * Create initial filter values from field configurations
 */
export declare function createInitialValues(fields: FilterFieldConfig[]): FilterValues;
/**
 * Validate filter values against field configurations
 */
export declare function validateFilterValues(values: FilterValues, fields: FilterFieldConfig[]): Record<string, string>;
/**
 * Clean filter values by removing empty/undefined values
 */
export declare function cleanFilterValues(values: FilterValues): FilterValues;
