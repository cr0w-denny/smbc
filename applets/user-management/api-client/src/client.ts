import { createFetchClient, createClient } from "@smbc/shared-query-client";
import type { paths } from "./generated/types.js";

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export function createApiClient(config: ApiClientConfig) {
  // Create the fetch client with openapi-fetch
  const fetchClient = createFetchClient<paths>({
    baseUrl: config.baseUrl,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  });

  // Create the React Query client
  const queryClient = createClient(fetchClient);

  return {
    // Expose both the fetch client and query client
    fetch: fetchClient,
    query: queryClient,

    // Expose individual hooks for convenience
    useQuery: queryClient.useQuery,
    useMutation: queryClient.useMutation,
    useInfiniteQuery: queryClient.useInfiniteQuery,
    useSuspenseQuery: queryClient.useSuspenseQuery,
  };
}

// Create a default client instance for convenience
export const defaultApiConfig: ApiClientConfig = {
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://api.smbc.com/api/v1"
      : "http://localhost:3000/api/v1",
};

export const apiClient = createApiClient(defaultApiConfig);

// Re-export types for convenience
export type { paths } from "./generated/types.js";
