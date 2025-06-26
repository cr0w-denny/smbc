// Re-export the openapi libraries for applets to use
export { default as createFetchClient } from "openapi-fetch";

// Re-export react-query integration
export { default as createClient } from "openapi-react-query";

// Utility function to create a typed API client with common configuration
import createClientDefault from "openapi-fetch";

export function createApiClient<
  T extends Record<string, any> = Record<string, any>
>(config: { baseUrl: string; headers?: Record<string, string> }) {
  return createClientDefault<T>({
    baseUrl: config.baseUrl,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  });
}

// Common error handling utilities
export class ApiError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
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
