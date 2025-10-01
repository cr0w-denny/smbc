import { tokens } from "./tokens.js";
import { resolveTokenReference } from "./tokenResolver.js";
import type {
  UITokens,
  ColorTokens,
  ShadowTokens,
  ZIndexTokens,
  TypographyTokens,
  BreakpointsTokens,
  SizeTokens,
  LayoutTokens
} from "./types.js";

// Type definition for our proxy tokens
type TokenFunction = {
  (): string;                    // No args = CSS variable
  (isDark: boolean): string;     // Boolean = resolve for mode
  (theme: any): string;          // Theme object = extract mode and resolve
  toString(): string;            // For implicit string conversion
  valueOf(): string;             // For valueOf operations
} & string;

// Get nested value from object using path array
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

// Create proxy for token access
function createTokenProxy(data: any, path: string[] = []): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        const newPath = [...path, prop];
        const value = getNestedValue(data, newPath);

        if (value !== undefined && (typeof value === 'string' || typeof value === 'number' || (typeof value === 'object' && 'light' in value && 'dark' in value))) {
          // This is a leaf node - create function proxy
          const leafProxy = new Proxy(() => {}, {
            apply(_target, _thisArg, args) {
              const cssVar = `var(--${newPath.join('-')})`;

              if (args.length === 0) {
                // No args = return resolved value (default to light mode)
                if (value && typeof value === 'object' && 'light' in value && 'dark' in value) {
                  return resolveTokenReference(String(value.light), data);
                }
                return resolveTokenReference(String(value), data);
              }

              const [param] = args;

              if (typeof param === 'boolean') {
                // Boolean = resolve for light/dark mode
                const isDark = param;

                // Handle light/dark value objects
                if (value && typeof value === 'object' && 'light' in value && 'dark' in value) {
                  const modeValue = isDark ? value.dark : value.light;
                  return resolveTokenReference(String(modeValue), data);
                }

                // Regular value - resolve with token data
                return resolveTokenReference(String(value), data);
              }

              if (typeof param === 'object' && param?.palette?.mode) {
                // Theme object = extract mode and resolve
                const isDark = param.palette.mode === 'dark';

                // Handle light/dark value objects
                if (value && typeof value === 'object' && 'light' in value && 'dark' in value) {
                  const modeValue = isDark ? value.dark : value.light;
                  return resolveTokenReference(String(modeValue), data);
                }

                // Regular value - resolve with token data
                return resolveTokenReference(String(value), data);
              }

              // Default to CSS variable
              return cssVar;
            }
          }) as TokenFunction;

          // Make it act like a string when used in string contexts
          leafProxy.toString = () => `var(--${newPath.join('-')})`;
          leafProxy.valueOf = () => `var(--${newPath.join('-')})`;

          return leafProxy;
        }

        if (value !== undefined && typeof value === 'object') {
          // This is a branch - create nested proxy
          return createTokenProxy(data, newPath);
        }
      }

      return undefined;
    }
  });
}

// Create proxies for all top-level token nodes with proper types and base paths
export const ui: UITokens = createTokenProxy(tokens, ['ui']) as UITokens;
export const color: ColorTokens = createTokenProxy(tokens, ['color']) as ColorTokens;
export const shadow: ShadowTokens = createTokenProxy(tokens, ['shadow']) as ShadowTokens;
export const zIndex: ZIndexTokens = createTokenProxy(tokens, ['zIndex']) as ZIndexTokens;
export const typography: TypographyTokens = createTokenProxy(tokens, ['typography']) as TypographyTokens;
export const breakpoints: BreakpointsTokens = createTokenProxy(tokens, ['breakpoints']) as BreakpointsTokens;
export const size: SizeTokens = createTokenProxy(tokens, ['size']) as SizeTokens;
export const layout: LayoutTokens = createTokenProxy(tokens, ['layout']) as LayoutTokens;