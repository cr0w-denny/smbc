// Re-export the openapi libraries for applets to use
export { default as createFetchClient } from "openapi-fetch";
import createClientDefault from "openapi-fetch";

// API Client Configuration
export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

// Import type only to avoid circular dependencies
import type { AppletMount } from './types';

// Registry of applet configurations set by the host
let appletRegistry = new Map<string, AppletMount>();

/**
 * Configure applets with their API base URLs (called by host application)
 */
export function configureApplets(applets: AppletMount[]): void {
  appletRegistry.clear();
  applets.forEach(applet => {
    appletRegistry.set(applet.id, applet);
  });
}

export function createApiClient<
  T extends Record<string, any> = Record<string, any>,
>(config: ApiClientConfig = {}, appletId?: string) {
  let baseUrl = config.baseUrl;
  
  // If no baseUrl provided, get it from applet configuration
  if (!baseUrl && appletId) {
    const applet = appletRegistry.get(appletId);
    baseUrl = applet?.apiBaseUrl || "http://localhost:3001/api/v1";
  }
  
  // Final fallback
  if (!baseUrl) {
    baseUrl = "http://localhost:3001/api/v1";
  }

  const finalConfig = {
    baseUrl,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  };
  console.log("Creating API client with config:", finalConfig);
  return createClientDefault<T>(finalConfig);
}

// Singleton API client registry
const apiClientRegistry = new Map<string, any>();

/**
 * Get or create an API client for a specific applet
 */
export function getApiClient<
  T extends Record<string, any> = Record<string, any>,
>(
  appletId: string,
  config: ApiClientConfig = {},
): ReturnType<typeof createClientDefault<T>> {
  if (!apiClientRegistry.has(appletId)) {
    apiClientRegistry.set(appletId, createApiClient<T>(config, appletId));
  }
  return apiClientRegistry.get(appletId);
}
