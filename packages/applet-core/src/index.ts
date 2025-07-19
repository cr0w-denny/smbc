export * from "./AppContext";
export * from "./hooks";
export * from "./permissions";
export * from "./types";

// Export specific types for convenience
export type { Environment } from "./types";

// Feature flags
export * from "./FeatureFlagProvider";

// Re-export useUser for convenience
export { useUser } from "./hooks";

// AutoFilter utilities for applets
export {
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
  createFilterSpec,
  useAutoFilter,
  AutoFilter,
} from "./autofilter";

export type { FilterFieldConfig, FilterValues, FilterSpec } from "./autofilter";

// OpenAPI utilities
export {
  extractQueryParameters,
  extractFromOperationType,
  parameterToFieldConfig,
  schemaToFieldConfig,
  generateLabel,
  createInitialValues,
  validateFilterValues,
  cleanFilterValues,
} from "./openapi/utils";

export type {
  OpenAPIParameter,
  AutoFilterConfig,
  UseAutoFilterParams,
} from "./openapi/types";

// Query client utilities
export {
  createFetchClient,
  createApiClient,
  getApiClient,
  getAppletApiUrl,
  useApiClient,
  getAvailableServers,
  getServerUrlFromSpec,
  _setAppletRegistry,
} from "./query-client";


// Navigation utilities
export {
  createNavigationExport,
  type NavigationConfig,
} from "./createNavigationExport";
