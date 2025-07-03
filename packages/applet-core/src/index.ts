export * from "./AppContext";
export * from "./hooks";
export * from "./permissions";
export * from "./types";

// Feature flags
export * from "./FeatureFlagProvider";

// Role management hooks
export * from "./usePersistedRoles";
export * from "./useAppletPermissions";
export * from "./usePermissionFilteredRoutes";
export * from "./useSimplePermissions";

// Host utilities
export * from "./host";
export * from "./permission-helpers";

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

// Hooks
export { useLocalStoragePersistence } from "./hooks/useLocalStoragePersistence";

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

// Filter utilities
export {
  useAutoFilterWithUrl,
  useUrlFilters,
} from "./filters/useAutoFilterWithUrl";

// Query client utilities
export { createFetchClient, createApiClient, ApiError, handleApiError, type ApiClientConfig } from "./query-client";

