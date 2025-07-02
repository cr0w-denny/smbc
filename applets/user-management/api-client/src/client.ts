import { createFetchClient } from "@smbc/applet-query-client";
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

  return fetchClient;
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
