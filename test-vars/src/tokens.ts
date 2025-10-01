import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { UITokens, ColorTokens, TokenStructure } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tokensData: TokenStructure = JSON.parse(readFileSync(join(__dirname, 'tokens.json'), 'utf-8'));

function createTokenProxy(data: any, path: string[] = []): any {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (typeof prop === 'string') {
        const newPath = [...path, prop];
        const value = getNestedValue(data, newPath);

        if (value !== undefined && (typeof value === 'string' || typeof value === 'number')) {
          // This is a leaf value, return a callable proxy
          return new Proxy(() => {}, {
            apply(target, thisArg, args) {
              // No args = return CSS variable
              if (args.length === 0) {
                return `var(--${newPath.join('-')})`;
              }

              // With args = return actual value
              // First arg could be isDark boolean or 'path' for dot notation
              const [param] = args;

              if (param === 'path') {
                return newPath.join('.');
              }

              if (typeof param === 'boolean') {
                // In real implementation, would resolve based on isDark
                return value; // Mock for now
              }

              // Default to value
              return value;
            }
          });
        } else if (value !== undefined && typeof value === 'object') {
          // This is an intermediate object, continue proxy chain
          return createTokenProxy(data, newPath);
        }

        // Property doesn't exist, but still return a proxy for potential future calls
        return createTokenProxy(data, newPath);
      }
      return target;
    }
  });
}

function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

// Export the top-level proxies with proper types
export const ui: UITokens = createTokenProxy(tokensData, ['ui']) as UITokens;
export const color: ColorTokens = createTokenProxy(tokensData, ['color']) as ColorTokens;

// Helper function to get all paths
export function getAllTokenPaths(): string[] {
  const paths: string[] = [];

  function traverse(obj: any, currentPath: string[] = []) {
    for (const key in obj) {
      const newPath = [...currentPath, key];
      const value = obj[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        traverse(value, newPath);
      } else {
        paths.push(newPath.join('.'));
      }
    }
  }

  traverse(tokensData);
  return paths;
}

// Helper function to generate CSS variables
export function generateCssVars(): string[] {
  const paths = getAllTokenPaths();
  return paths.map(path => `--${path.replace(/\./g, '-')}`);
}