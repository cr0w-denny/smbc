// Core exports
export { default as QueryClientManager } from './QueryClientManager';
export { SMBCQueryProvider, useSMBCQuery } from './SMBCQueryProvider';
export type { SMBCQueryProviderProps, SMBCQueryContextValue } from './SMBCQueryProvider';

// MSW integration (optional)
export { setupMswForSharedProvider, stopMswForSharedProvider, registerMswHandlers, isMswAvailable } from './msw-integration';
export type { ApiConfig } from './msw-integration';

// Re-export QueryClient for convenience
export { QueryClient, useQueryClient } from '@tanstack/react-query';
export type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

// OpenAPI client utilities
export {
  createFetchClient,
  createClient,
  createApiClient,
  ApiError,
  handleApiError
} from './openapi-client';
