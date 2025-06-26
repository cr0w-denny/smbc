/**
 * AutoFilter - Auto-generating filter components from OpenAPI specs
 */

// Main components
export { AutoFilter, AutoFilterFromOperation, AutoFilterFromFields } from './AutoFilter';

// Hooks
export {
  useAutoFilterFromOperation,
  useAutoFilterFromFields,
  createFilterField,
  filterFieldPresets,
} from './useAutoFilter';

export {
  useAutoFilterWithUrlFromOperation,
  useAutoFilterWithUrlFromFields,
  useUrlFilters,
} from './useAutoFilterWithUrl';

// Types
export type {
  OpenAPIParameter,
  FilterFieldConfig,
  FilterValues,
  AutoFilterConfig,
  UseAutoFilterParams,
} from './types';

// Utilities
export {
  extractQueryParameters,
  extractFromOperationType,
  parameterToFieldConfig,
  schemaToFieldConfig,
  generateLabel,
  createInitialValues,
  validateFilterValues,
  cleanFilterValues,
} from './utils';

// Operation type helpers (re-export from mui-applet-core)
export {
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
} from '@smbc/mui-applet-core';

// Default export
export { AutoFilter as default } from './AutoFilter';