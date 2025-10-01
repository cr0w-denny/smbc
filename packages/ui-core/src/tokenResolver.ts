import { tokens } from './tokens.js';

// Type for token reference like "{color.gray300}"
type TokenReference = string;

// Cache for resolved tokens to avoid repeated lookups
const resolvedCache = new Map<string, any>();

/**
 * Resolves token references like "{color.gray300}" to actual values
 * Handles nested references and circular reference detection
 * @param reference The token reference string
 * @param tokenData Optional token data object (defaults to main tokens)
 * @param visited Set for circular reference detection
 */
export function resolveTokenReference(
  reference: TokenReference,
  tokenData: any = tokens,
  visited = new Set<string>()
): any {
  // If it's not a reference (doesn't have {} or var(--)), return as-is
  if (typeof reference !== 'string' || (!reference.includes('{') && !reference.startsWith('var(--'))) {
    return reference;
  }

  // Create cache key that includes token data context
  const cacheKey = `${reference}_${JSON.stringify(tokenData) === JSON.stringify(tokens) ? 'default' : 'custom'}`;

  // Check cache first
  if (resolvedCache.has(cacheKey)) {
    return resolvedCache.get(cacheKey);
  }

  // Circular reference detection
  if (visited.has(reference)) {
    console.warn(`Circular reference detected: ${reference}`);
    return reference; // Return the reference string to avoid infinite loops
  }

  visited.add(reference);

  try {
    // Extract token path from {token.path} or var(--token-path)
    let tokenPath: string;

    if (reference.startsWith('var(--') && reference.endsWith(')')) {
      // Handle var(--token-path) format
      tokenPath = reference.slice(6, -1).replace(/-/g, '.');
    } else {
      // Handle {token.path} format
      const tokenMatch = reference.match(/\{([^}]+)\}/);
      if (!tokenMatch) {
        return reference;
      }
      tokenPath = tokenMatch[1];
    }

    // Check for global overrides first
    const globalOverrides = (typeof window !== 'undefined' ? (window as any)?.__tokenOverrides : undefined);
    if (globalOverrides && tokenPath in globalOverrides) {
      const overrideValue = globalOverrides[tokenPath];
      // Cache the override value
      resolvedCache.set(cacheKey, overrideValue);
      return overrideValue;
    }

    const pathParts = tokenPath.split('.');

    // Navigate through the token data object
    let value: any = tokenData;
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        console.warn(`Token path not found: ${tokenPath}`);
        return reference; // Return original reference if path not found
      }
    }

    // If the resolved value is also a reference, resolve it recursively
    if (typeof value === 'string' && ((value.includes('{') && value.includes('}')) || value.startsWith('var(--'))) {
      value = resolveTokenReference(value, tokenData, visited);
    }

    // Cache the resolved value
    resolvedCache.set(cacheKey, value);

    return value;
  } catch (error) {
    console.warn(`Error resolving token reference ${reference}:`, error);
    return reference;
  } finally {
    visited.delete(reference);
  }
}

/**
 * Recursively resolves all token references in an object/array structure
 */
export function resolveTokens(obj: any, tokenData: any = tokens, visited = new Set<string>()): any {
  if (typeof obj === 'string') {
    return resolveTokenReference(obj, tokenData, visited);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTokens(item, tokenData, visited));
  }

  if (obj && typeof obj === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveTokens(value, tokenData, visited);
    }
    return resolved;
  }

  return obj;
}

/**
 * Get a token value by path, resolving any references
 * Usage: getToken('color.gray300') or getToken('ui.input.base.default.borderColor')
 */
export function getToken(tokenPath: string, tokenData: any = tokens): any {
  const pathParts = tokenPath.split('.');
  let value: any = tokenData;

  for (const part of pathParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      console.warn(`Token path not found: ${tokenPath}`);
      return undefined;
    }
  }

  return resolveTokens(value, tokenData);
}

/**
 * Get all available token paths for autocomplete
 */
export function getAllTokenPaths(obj: any = tokens, prefix = '', paths: string[] = []): string[] {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // If it's an object, recurse deeper
      getAllTokenPaths(value, currentPath, paths);
    } else {
      // If it's a leaf value, add the path
      paths.push(currentPath);
    }
  }

  return paths;
}

/**
 * Validate if a token reference path exists
 */
export function isValidTokenPath(tokenPath: string, tokenData: any = tokens): boolean {
  const pathParts = tokenPath.split('.');
  let value: any = tokenData;

  for (const part of pathParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Clear the resolution cache (useful for development)
 */
export function clearTokenCache(): void {
  resolvedCache.clear();
}