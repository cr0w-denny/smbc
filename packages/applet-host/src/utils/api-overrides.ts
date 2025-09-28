/**
 * Pattern-based API URL mapping configuration
 */
export interface ApiUrlMapping {
  /** URL pattern to match (supports wildcards) */
  pattern: string;
  /** Environment variable name to use as replacement */
  envVar: string;
}

/**
 * Function that generates API URL overrides based on an applet's API spec
 */
export type ApiOverrideFunction = (
  servers: Array<{ url: string; description?: string }>
) => Array<{ url: string; description?: string }> | undefined;

/**
 * Check if a URL matches a pattern
 */
function matchesPattern(url: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\*/g, ".*")
    .replace(/\?/g, "\\?");
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Get environment variable value
 */
function getEnvVar(envVar: string): string | undefined {
  return (import.meta as any).env?.[envVar] || (typeof process !== 'undefined' ? process?.env?.[envVar] : undefined);
}

/**
 * Create an API override function based on pattern mappings
 */
export function createApiOverrides(
  mappings: ApiUrlMapping[]
): ApiOverrideFunction {
  // Check if any env vars are set - if not, return a function that always returns undefined
  const hasAnyEnvVars = mappings.some(mapping => getEnvVar(mapping.envVar));
  if (!hasAnyEnvVars) {
    return () => undefined;
  }

  return (servers: Array<{ url: string; description?: string }>) => {
    const overrides: Array<{ url: string; description?: string }> = [];

    for (const server of servers) {
      let overrideApplied = false;

      // Check each mapping against this server
      for (const mapping of mappings) {
        if (matchesPattern(server.url, mapping.pattern)) {
          const envValue = getEnvVar(mapping.envVar);

          if (envValue) {
            overrides.push({
              url: envValue,
              description: server.description,
            });
            overrideApplied = true;
            break; // Use first matching pattern
          }
        }
      }

      // If no override was applied, don't include this server in overrides
      // (mountApplet will keep the original)
    }

    return overrides.length > 0 ? overrides : undefined;
  };
}