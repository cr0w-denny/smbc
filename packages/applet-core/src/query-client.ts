// Re-export the openapi libraries for applets to use
export { default as createFetchClient } from "openapi-fetch";
import createClientDefault from "openapi-fetch";

// API Client Configuration
export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

const defaultConfig: ApiClientConfig = {
  baseUrl: "/api/v1",
};

export function createApiClient<T extends Record<string, any> = Record<string, any>>(
  config: ApiClientConfig = {}
) {
  const finalConfig = {
    baseUrl: config.baseUrl || defaultConfig.baseUrl!,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  };
  
  return createClientDefault<T>(finalConfig);
}

// Common error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = error?.status || error?.response?.status;
  const message = error?.message || "An API error occurred";

  return new ApiError(message, status, error?.response);
}