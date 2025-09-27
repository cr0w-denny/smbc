// Re-export the openapi libraries for applets to use
export { default as createFetchClient } from "openapi-fetch";
import createClientDefault from "openapi-fetch";

// API Client Configuration
export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

// Import type only to avoid circular dependencies
import type { AppletMount, Environment } from './types';
import { useFeatureFlag } from './FeatureFlagProvider';



// Registry of applet configurations set by the host
let appletRegistry = new Map<string, AppletMount>();

/**
 * Internal function to set applet registry (called by @smbc/applet-host)
 * Use configureApplets from @smbc/applet-host instead
 */
export function _setAppletRegistry(applets: AppletMount[]): void {
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

/**
 * Get all available servers from OpenAPI spec
 */
export function getAvailableServers(apiSpec: any): Array<{url: string, description: string}> {
  // Handle wrapped API spec (when passed as { name, spec })
  const actualSpec = apiSpec?.spec || apiSpec;
  
  if (!actualSpec?.servers || !Array.isArray(actualSpec.servers)) {
    return [];
  }
  
  return actualSpec.servers.map((server: any) => ({
    url: server.url,
    description: server.description || server.url
  }));
}


/**
 * Get server URL from OpenAPI spec based on environment
 */
export function getServerUrlFromSpec(
  apiSpec: any,
  environment: Environment = 'development'
): string {
  const servers = getAvailableServers(apiSpec);
  
  if (servers.length === 0) {
    throw new Error('No servers found in API spec');
  }
  
  console.log(`🔍 getServerUrlFromSpec: Looking for environment '${environment}' in servers:`, servers);
  
  // Map environment names to server description aliases
  const environmentAliases: Record<Environment, string[]> = {
    'mock': ['mock'],
    'local': ['local'],
    'development': ['development', 'dev'],
    'qa': ['qa', 'staging'],
    'production': ['production', 'prod']
  };
  
  // First try exact match with description or aliases
  const aliases = environmentAliases[environment] || [environment];
  for (const alias of aliases) {
    for (const server of servers) {
      if (server.description === alias) {
        return server.url;
      }
    }
  }
  
  // Try to find server by description matching environment (case-insensitive)
  for (const server of servers) {
    const desc = server.description?.toLowerCase() || '';
    if (desc.includes(environment)) {
      return server.url;
    }
  }
  
  // Special case: Look for "mock" in description when environment is "mock"
  if (environment === 'mock') {
    for (const server of servers) {
      const desc = server.description?.toLowerCase() || '';
      if (desc.includes('mock')) {
        return server.url;
      }
    }
  }
  
  // Fallback logic based on environment
  if (environment === 'development' || environment === 'mock' || environment === 'local') {
    // For dev/mock/local, prefer first server (usually local/dev)
    return servers[0].url;
  } else if (environment === 'production') {
    // For prod, prefer last server (usually production)
    return servers[servers.length - 1].url;
  }
  
  // Default to first server
  return servers[0].url;
}

/**
 * Get the API base URL for an applet (resolves from apiSpec dynamically)
 * @throws Error if applet is not configured or has no apiSpec
 */
export function getAppletApiUrl(appletId: string, environment: Environment = 'development'): string {
  const applet = appletRegistry.get(appletId);
  if (!applet) {
    throw new Error(`Applet '${appletId}' is not configured. Make sure configureApplets() was called with this applet.`);
  }
  
  // If apiBaseUrl is explicitly set, use it (for backwards compatibility)
  if (applet.apiBaseUrl) {
    return applet.apiBaseUrl;
  }
  
  // Otherwise, resolve from apiSpec
  if (!applet.apiSpec) {
    throw new Error(`Applet '${appletId}' has no apiSpec configured.`);
  }
  
  console.log('About to call getServerUrlFromSpec with:', { appletId, apiSpec: applet.apiSpec, environment });
  const serverUrl = getServerUrlFromSpec(applet.apiSpec, environment);
  console.log(`🔗 ${appletId} resolved to server URL: ${serverUrl} (environment: ${environment})`);
  return serverUrl;
}

/**
 * React hook that creates an API client for a specific applet using the current environment from feature flags
 * @throws Error if applet is not configured or has no apiSpec
 */
/**
 * React hook that creates an API client with optional custom headers
 * This is the base implementation - use useApiClient for a simpler interface
 */
export function useApiClientBase<T extends Record<string, any> = Record<string, any>>(
  appletId: string
): ReturnType<typeof createClientDefault<T>> {
  const environment = useFeatureFlag<Environment>('development') || 'development';

  const cacheKey = `${appletId}-${environment}`;

  // Check if we already have a client for this applet + environment combination
  if (apiClientRegistry.has(cacheKey)) {
    return apiClientRegistry.get(cacheKey);
  }

  const baseUrl = getAppletApiUrl(appletId, environment);

  // Create custom fetch function that reads headers dynamically from global
  const customFetch: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);

    // Read impersonation email from global variable set by DevContext
    const impersonateEmail = (window as any).__devImpersonateEmail;
    if (impersonateEmail) {
      headers.set('X-Impersonate', impersonateEmail);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };

  const client = createClientDefault<T>({
    baseUrl,
    fetch: customFetch
  });

  // Cache the client
  apiClientRegistry.set(cacheKey, client);

  return client;
}

/**
 * React hook that creates an API client for a specific applet
 * @param appletId - The ID of the applet
 */
export function useApiClient<T extends Record<string, any> = Record<string, any>>(
  appletId: string
): ReturnType<typeof createClientDefault<T>> {
  return useApiClientBase<T>(appletId);
}
