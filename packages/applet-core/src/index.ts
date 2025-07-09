export * from "./AppContext";
export * from "./hooks";
export * from "./permissions";
export * from "./types";

// Feature flags
export * from "./FeatureFlagProvider";

// Host utilities
export * from "./host";

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
  configureApplets,
  type ApiClientConfig,
} from "./query-client";

// Route utilities for automatic mountPath injection
export {
  withMountPath,
  processAppletRoutes,
  mountApplet,
  mountApplets,
} from "./route-utils";

// Navigation utilities
export {
  createNavigationExport,
  createSimpleNavigationExport,
  type NavigationConfig,
} from "./createNavigationExport";
