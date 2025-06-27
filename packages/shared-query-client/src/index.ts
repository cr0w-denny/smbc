// Core exports
export { default as QueryClientManager } from "./QueryClientManager";
export { SMBCQueryProvider, useSMBCQuery } from "./SMBCQueryProvider";
export type {
  SMBCQueryProviderProps,
  SMBCQueryContextValue,
} from "./SMBCQueryProvider";

// MSW integration
export {
  setupMswForSharedProvider,
  stopMswForSharedProvider,
  registerMswHandlers,
  isMswAvailable,
} from "./msw-integration";
export type { ApiConfig } from "./msw-integration";

// OpenAPI client utilities
export {
  createFetchClient,
  createClient,
  createApiClient,
  ApiError,
  handleApiError,
} from "./openapi-client";
