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

// Cascade resolution following CSS-like specificity
function resolveWithCascade(tokens: any, scope: string, component: string, property: string, variant?: string, state?: string): any {
  const paths = [];

  // Build cascade paths in order of specificity (most specific first)
  if (scope !== 'ui') {
    // Scope-specific paths
    if (variant && state) {
      paths.push([scope, component, variant, state, property]);
    }
    if (variant) {
      paths.push([scope, component, variant, property]);
    }
    if (state) {
      paths.push([scope, component, state, property]);
    }
    paths.push([scope, component, property]);
  }

  // UI fallback paths
  if (variant && state) {
    paths.push(['ui', component, variant, state, property]);
  }
  if (variant) {
    paths.push(['ui', component, variant, property]);
  }
  if (state) {
    paths.push(['ui', component, state, property]);
  }
  paths.push(['ui', component, property]);

  // Try each path until we find a value
  for (const path of paths) {
    const value = getNestedValue(tokens, path);
    if (value !== undefined) {
      return { value, path };
    }
  }

  return { value: undefined, path: [] };
}

// Create proxy for token access with cascade resolution
function createTokenProxy(data: any, path: string[] = [], scope?: string): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        const newPath = [...path, prop];

        // If we're in a scope context and accessing a component, use cascade resolution
        if (scope && path.length === 0) {
          // This is a component access (e.g., modal.input)
          return createComponentProxy(data, scope, prop);
        }

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
          return createTokenProxy(data, newPath, scope);
        }
      }

      return undefined;
    }
  });
}

// Create component proxy that supports cascade resolution
function createComponentProxy(data: any, scope: string, component: string): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        // Determine if this is a variant, state, or property
        const uiComponent = getNestedValue(data, ['ui', component]);
        if (!uiComponent) return undefined;

        // Check if prop is a known variant (not a state or property)
        // A variant exists if it's in the UI component OR in the scope-specific overrides
        const uiVariant = uiComponent[prop];
        const scopeVariant = scope !== 'ui' ? getNestedValue(data, [scope, component, prop]) : undefined;

        const isVariant = prop !== 'hover' && prop !== 'focus' && prop !== 'active' && prop !== 'disabled' && prop !== 'error' &&
                          ((typeof uiVariant === 'object' && !('light' in uiVariant && 'dark' in uiVariant)) ||
                           (typeof scopeVariant === 'object' && !('light' in scopeVariant && 'dark' in scopeVariant)));

        if (isVariant) {
          // This is a variant access (e.g., modal.input.secondary)
          return createVariantProxy(data, scope, component, prop);
        } else {
          // This could be a property or state access
          const isState = ['hover', 'focus', 'active', 'disabled', 'error'].includes(prop);

          if (isState) {
            // This is a state access (e.g., modal.input.hover)
            return createStateProxy(data, scope, component, undefined, prop);
          } else {
            // This is a property access (e.g., modal.input.borderColor)
            return createPropertyProxy(data, scope, component, prop);
          }
        }
      }

      return undefined;
    }
  });
}

// Create variant proxy that supports further traversal
function createVariantProxy(data: any, scope: string, component: string, variant: string): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        const isState = ['hover', 'focus', 'active', 'disabled', 'error'].includes(prop);

        if (isState) {
          // This is a variant state access (e.g., modal.input.secondary.hover)
          return createStateProxy(data, scope, component, variant, prop);
        } else {
          // This is a variant property access (e.g., modal.input.secondary.borderColor)
          return createPropertyProxy(data, scope, component, prop, variant);
        }
      }

      return undefined;
    }
  });
}

// Create state proxy that supports property access
function createStateProxy(data: any, scope: string, component: string, variant: string | undefined, state: string): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        // This is a state property access (e.g., modal.input.hover.borderColor)
        return createPropertyProxy(data, scope, component, prop, variant, state);
      }

      return undefined;
    }
  });
}

// Create property proxy with cascade resolution
function createPropertyProxy(data: any, scope: string, component: string, property: string, variant?: string, state?: string): any {
  const { value, path } = resolveWithCascade(data, scope, component, property, variant, state);

  if (value === undefined) return undefined;

  // Create function proxy for the resolved value
  const leafProxy = new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      const cssVar = `var(--${path.join('-')})`;

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
  leafProxy.toString = () => `var(--${path.join('-')})`;
  leafProxy.valueOf = () => `var(--${path.join('-')})`;

  return leafProxy;
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

// Create scope-aware proxies for cascade resolution
export const modal: UITokens = createTokenProxy(tokens, [], 'modal') as UITokens;
export const appbar: UITokens = createTokenProxy(tokens, [], 'appbar') as UITokens;
export const sidebar: UITokens = createTokenProxy(tokens, [], 'sidebar') as UITokens;
export const card: UITokens = createTokenProxy(tokens, [], 'card') as UITokens;