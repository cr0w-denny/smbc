/**
 * Auto-generated API server configurations
 * 
 * This file is generated from OpenAPI specs in applet directories.
 * Do not edit manually - run 'npm run generate:api-servers' to regenerate.
 * 
 * Generated on: 2025-07-13T17:09:43.419Z
 */

export interface ServerConfig {
  production?: string;
  development?: string;
  mock?: string;
}

export const API_SERVERS: Record<string, ServerConfig> = {
  "user-management": {
    "mock": "/api/v1/user-management",
    "development": "http://localhost:3001/api/v1/user-management",
    "production": "https://api.smbcgroup.com/api/v1/user-management"
  },
  "product-catalog": {
    "mock": "/api/v1/product-catalog",
    "development": "http://localhost:3001/api/v1/product-catalog",
    "production": "https://api.smbcgroup.com/api/v1/product-catalog"
  },
  "employee-directory": {
    "mock": "/api/v1/employee-directory",
    "development": "http://localhost:3001/api/v1/employee-directory",
    "production": "https://api.smbcgroup.com/api/v1/employee-directory"
  },
  "usage-stats": {
    "mock": "/api/v1/usage-stats",
    "development": "http://localhost:3001/api/v1/usage-stats",
    "production": "https://api.smbcgroup.com/api/v1/usage-stats"
  }
} as const;

export type AppletId = keyof typeof API_SERVERS;

/**
 * Get server URL for an applet based on environment
 */
export function getServerUrl(
  appletId: AppletId,
  environment: 'production' | 'development' | 'mock' = 'development'
): string {
  const config = API_SERVERS[appletId];
  
  if (!config) {
    throw new Error(`No server configuration found for applet: ${appletId}`);
  }
  
  const url = config[environment];
  
  if (!url) {
    // Fallback order: development -> production -> first available
    const fallback = config.development || config.production || Object.values(config)[0];
    if (!fallback) {
      throw new Error(`No server URL found for applet ${appletId} in any environment`);
    }
    console.warn(`No ${environment} server for ${appletId}, using fallback: ${fallback}`);
    return fallback;
  }
  
  return url;
}

/**
 * Get server URL for a specific environment
 */
export function getApiUrl(
  appletId: AppletId,
  environment: 'production' | 'development' | 'mock' = 'development'
): string {
  return getServerUrl(appletId, environment);
}
