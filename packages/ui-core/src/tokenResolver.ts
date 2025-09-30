import { tokens } from './tokens';

// Type for token reference like "{color.gray300}"
type TokenReference = string;

// Cache for resolved tokens to avoid repeated lookups
const resolvedCache = new Map<string, any>();

/**
 * Resolves token references like "{color.gray300}" to actual values
 * Handles nested references and circular reference detection
 */
export function resolveTokenReference(reference: TokenReference, visited = new Set<string>()): any {
  // If it's not a reference (doesn't have {}), return as-is
  if (typeof reference !== 'string' || !reference.includes('{') || !reference.includes('}')) {
    return reference;
  }

  // Check cache first
  if (resolvedCache.has(reference)) {
    return resolvedCache.get(reference);
  }

  // Circular reference detection
  if (visited.has(reference)) {
    console.warn(`Circular reference detected: ${reference}`);
    return reference; // Return the reference string to avoid infinite loops
  }

  visited.add(reference);

  try {
    // Extract token path from {token.path}
    const tokenMatch = reference.match(/\{([^}]+)\}/);
    if (!tokenMatch) {
      return reference;
    }

    const tokenPath = tokenMatch[1];

    // Check for global overrides first
    const globalOverrides = (window as any)?.__tokenOverrides;
    if (globalOverrides && tokenPath in globalOverrides) {
      const overrideValue = globalOverrides[tokenPath];
      console.log('🎨 Using override for', tokenPath, ':', overrideValue);
      // Cache the override value
      resolvedCache.set(reference, overrideValue);
      return overrideValue;
    }

    const pathParts = tokenPath.split('.');

    // Navigate through the tokens object
    let value: any = tokens;
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        console.warn(`Token path not found: ${tokenPath}`);
        return reference; // Return original reference if path not found
      }
    }

    // If the resolved value is also a reference, resolve it recursively
    if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
      value = resolveTokenReference(value, visited);
    }

    // Cache the resolved value
    resolvedCache.set(reference, value);

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
export function resolveTokens(obj: any, visited = new Set<string>()): any {
  if (typeof obj === 'string') {
    return resolveTokenReference(obj, visited);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTokens(item, visited));
  }

  if (obj && typeof obj === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveTokens(value, visited);
    }
    return resolved;
  }

  return obj;
}

/**
 * Get a token value by path, resolving any references
 * Usage: getToken('color.gray300') or getToken('ui.input.base.default.borderColor')
 */
export function getToken(tokenPath: string): any {
  const pathParts = tokenPath.split('.');
  let value: any = tokens;

  for (const part of pathParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      console.warn(`Token path not found: ${tokenPath}`);
      return undefined;
    }
  }

  return resolveTokens(value);
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
export function isValidTokenPath(tokenPath: string): boolean {
  const pathParts = tokenPath.split('.');
  let value: any = tokens;

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