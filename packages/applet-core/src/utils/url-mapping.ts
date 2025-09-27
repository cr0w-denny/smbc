import type { ApiUrlMapping } from '../types';

/**
 * Check if a URL matches a pattern with wildcard support
 * @param url - The URL to check
 * @param pattern - The pattern to match against (supports * wildcards)
 * @returns true if URL matches the pattern
 */
export function matchesUrlPattern(url: string, pattern: string): boolean {
  // Convert pattern to regex, escaping special characters except *
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\\\*/g, '.*'); // Convert * to .* for regex

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Apply URL mappings to a server URL based on environment variables
 * @param url - The original server URL
 * @param mappings - Array of URL mappings to apply
 * @param currentEnv - Current environment (development, production, test)
 * @returns The mapped URL or original if no mapping applies
 */
export function applyUrlMapping(
  url: string,
  mappings: ApiUrlMapping[] | undefined,
  currentEnv: string = 'development'
): string {
  if (!mappings || mappings.length === 0) {
    return url;
  }

  // Find the first matching mapping
  for (const mapping of mappings) {
    // Check if this mapping applies to the current environment
    if (mapping.environments && !mapping.environments.includes(currentEnv as any)) {
      continue;
    }

    // Check if the URL matches the pattern
    if (matchesUrlPattern(url, mapping.pattern)) {
      // Get the environment variable value
      const envValue = import.meta.env?.[mapping.envVar] || process?.env?.[mapping.envVar];

      if (envValue) {
        return envValue;
      }
    }
  }

  // No mapping applied, return original URL
  return url;
}

/**
 * Apply URL mappings to all servers in an API spec
 * @param apiSpec - The OpenAPI specification
 * @param mappings - Array of URL mappings to apply
 * @param currentEnv - Current environment
 * @returns Modified API spec with mapped URLs
 */
export function applyUrlMappingsToSpec(
  apiSpec: any,
  mappings: ApiUrlMapping[] | undefined,
  currentEnv: string = 'development'
): any {
  if (!apiSpec || !mappings) {
    return apiSpec;
  }

  // Handle wrapped API spec (when passed as { name, spec })
  const actualSpec = apiSpec?.spec || apiSpec;

  if (!actualSpec?.servers || !Array.isArray(actualSpec.servers)) {
    return apiSpec;
  }

  // Create a modified copy of the spec
  const modifiedSpec = {
    ...actualSpec,
    servers: actualSpec.servers.map((server: any) => ({
      ...server,
      url: applyUrlMapping(server.url, mappings, currentEnv),
      originalUrl: server.originalUrl || server.url // Keep original for reference
    }))
  };

  // Return in the same format as received
  if (apiSpec?.spec) {
    return {
      ...apiSpec,
      spec: modifiedSpec
    };
  }

  return modifiedSpec;
}

/**
 * Get the best matching URL from mappings or fall back to original logic
 * @param servers - Array of server configurations
 * @param mappings - Array of URL mappings to apply
 * @param environment - Target environment
 * @returns The best matching server URL
 */
export function getBestServerUrl(
  servers: Array<{ url: string; description?: string }>,
  mappings: ApiUrlMapping[] | undefined,
  environment: string = 'development'
): string {
  if (servers.length === 0) {
    throw new Error('No servers found in API spec');
  }

  // First, try to apply URL mappings
  for (const server of servers) {
    const mappedUrl = applyUrlMapping(server.url, mappings, environment);
    if (mappedUrl !== server.url) {
      // A mapping was applied
      return mappedUrl;
    }
  }

  // No mappings applied, fall back to environment-based selection
  // This preserves the original logic from getServerUrlFromSpec

  // Map environment names to server description aliases
  const environmentAliases: Record<string, string[]> = {
    'mock': ['mock'],
    'local': ['local'],
    'development': ['development', 'dev'],
    'qa': ['qa', 'staging'],
    'production': ['production', 'prod']
  };

  // Try exact match with description or aliases
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
 * Priority-based pattern matching for URL mappings
 * Returns mappings sorted by priority (most specific first)
 */
export function sortMappingsByPriority(mappings: ApiUrlMapping[]): ApiUrlMapping[] {
  return [...mappings].sort((a, b) => {
    // Exact domain matches have highest priority
    const aHasDomain = a.pattern.includes('://');
    const bHasDomain = b.pattern.includes('://');
    if (aHasDomain && !bHasDomain) return -1;
    if (!aHasDomain && bHasDomain) return 1;

    // More specific patterns (more slashes) have higher priority
    const aSlashes = (a.pattern.match(/\//g) || []).length;
    const bSlashes = (b.pattern.match(/\//g) || []).length;
    if (aSlashes !== bSlashes) return bSlashes - aSlashes;

    // Fewer wildcards have higher priority
    const aWildcards = (a.pattern.match(/\*/g) || []).length;
    const bWildcards = (b.pattern.match(/\*/g) || []).length;
    return aWildcards - bWildcards;
  });
}