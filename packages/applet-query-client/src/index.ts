// Core exports
export { default as QueryClientManager } from "./QueryClientManager";
export { AppletQueryProvider, useAppletQuery } from "./AppletQueryProvider";
export type {
  AppletQueryProviderProps,
  AppletQueryContextValue,
} from "./AppletQueryProvider";

// MSW integration
export {
  setupMswForAppletProvider,
  stopMswForAppletProvider,
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
