/**
 * API endpoint override utilities for development
 *
 * Supports environment variables in the format:
 * VITE_API_EVENTS_DEV=http://localhost:8080
 * VITE_API_EVENTS_QA=https://api-qa.example.com
 * etc.
 */

// Extend ImportMeta interface to include env
declare global {
  interface ImportMetaEnv {
    [key: string]: string | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface ServerInfo {
  url: string;
  description: string;
  isOverride?: boolean;
}

/**
 * Get available servers with environment variable overrides
 * Enhances the base getAvailableServers from applet-core
 */
export function getAvailableServersWithOverrides(
  apiSpec: any,
  appletId?: string
): ServerInfo[] {
  // Handle wrapped API spec (when passed as { name, spec })
  const actualSpec = apiSpec?.spec || apiSpec;

  // Start with servers from API spec
  const baseServers: ServerInfo[] = actualSpec?.servers?.map((server: any) => ({
    url: server.url,
    description: server.description || server.url,
    isOverride: false
  })) || [];

  // Add environment variable overrides
  const overrideServers: ServerInfo[] = [];

  if (appletId) {
    const appletPrefix = `VITE_API_${appletId.toUpperCase()}_`;

    // Common environment suffixes
    const envSuffixes = ['DEV', 'QA', 'STAGING', 'PROD', 'LOCAL'];

    envSuffixes.forEach(suffix => {
      const envVar = `${appletPrefix}${suffix}`;
      const url = import.meta.env[envVar];

      if (url) {
        overrideServers.push({
          url,
          description: `${suffix.toLowerCase()} (override)`,
          isOverride: true
        });
      }
    });

    // Also check for generic override
    const genericOverride = import.meta.env[`${appletPrefix}URL`];
    if (genericOverride) {
      overrideServers.push({
        url: genericOverride,
        description: 'custom (override)',
        isOverride: true
      });
    }
  }

  // Combine base servers with overrides, overrides first
  return [...overrideServers, ...baseServers];
}

/**
 * Get all environment variable overrides for debugging
 */
export function getApiOverrides(): Record<string, string> {
  const overrides: Record<string, string> = {};

  // Get all environment variables that start with VITE_API_
  Object.entries(import.meta.env).forEach(([key, value]) => {
    if (key.startsWith('VITE_API_') && typeof value === 'string') {
      overrides[key] = value;
    }
  });

  return overrides;
}

/**
 * Check if a server URL is from an environment override
 */
export function isOverrideServer(url: string, appletId?: string): boolean {
  if (!appletId) return false;

  const appletPrefix = `VITE_API_${appletId.toUpperCase()}_`;
  const envSuffixes = ['DEV', 'QA', 'STAGING', 'PROD', 'LOCAL', 'URL'];

  return envSuffixes.some(suffix => {
    const envVar = `${appletPrefix}${suffix}`;
    return import.meta.env[envVar] === url;
  });
}