/**
 * AutoFilter - Auto-generating filter components from OpenAPI specs
 */

// Main components
export {
  AutoFilter,
  AutoFilterFromOperation,
  AutoFilterFromFields,
} from "./AutoFilter";

// Hooks
export {
  useAutoFilterFromOperation,
  useAutoFilterFromFields,
  createFilterField,
  filterFieldPresets,
} from "./useAutoFilter";


// Types
export type {
  OpenAPIParameter,
  FilterFieldConfig,
  FilterValues,
  AutoFilterConfig,
  UseAutoFilterParams,
} from "./types";

// Re-export framework-agnostic utilities from applet-core
export {
  extractQueryParameters,
  extractFromOperationType,
  parameterToFieldConfig,
  schemaToFieldConfig,
  generateLabel,
  createInitialValues,
  validateFilterValues,
  cleanFilterValues,
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
  useAutoFilterWithUrl,
  useUrlFilters,
} from "@smbc/applet-core";

// Default export
export { AutoFilter as default } from "./AutoFilter";
