import { tokens } from './tokens.js';
import { resolveTokenReference } from './tokenResolver.js';

/**
 * Generate CSS custom properties from token structure
 */
export function generateCSSVariables(): string {
  const css: string[] = [];
  const lightVariables: { [key: string]: string } = {};
  const darkVariables: { [key: string]: string } = {};

  // Helper to extract light/dark values and flatten tokens into CSS variables
  function processTokens(obj: any, path: string[] = []): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Check if this object has light/dark variants
        if ('light' in value && 'dark' in value) {
          // This is a light/dark token
          const cssVarName = `--${currentPath.join('-')}`;

          // Resolve light value
          let lightValue = value.light;
          if (typeof lightValue === 'string' && lightValue.includes('{') && lightValue.includes('}')) {
            lightValue = resolveTokenReference(lightValue, tokens);
          }
          lightVariables[cssVarName] = String(lightValue);

          // Resolve dark value
          let darkValue = value.dark;
          if (typeof darkValue === 'string' && darkValue.includes('{') && darkValue.includes('}')) {
            darkValue = resolveTokenReference(darkValue, tokens);
          }
          darkVariables[cssVarName] = String(darkValue);
        } else {
          // Regular nested object, recurse
          processTokens(value, currentPath);
        }
      } else {
        // This is a regular leaf value
        const cssVarName = `--${currentPath.join('-')}`;
        let resolvedValue = value;

        // Resolve token references
        if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
          resolvedValue = resolveTokenReference(value, tokens);
        }

        lightVariables[cssVarName] = String(resolvedValue);
      }
    }
  }

  // Process all tokens
  processTokens(tokens);

  // Generate light mode variables (default)
  css.push(':root {');
  for (const [name, value] of Object.entries(lightVariables)) {
    css.push(`  ${name}: ${value};`);
  }
  css.push('}');

  css.push('');

  // Generate dark mode variables if any exist
  if (Object.keys(darkVariables).length > 0) {
    css.push('[data-theme="dark"] {');
    for (const [name, value] of Object.entries(darkVariables)) {
      css.push(`  ${name}: ${value};`);
    }
    css.push('}');
  }

  return css.join('\n');
}

/**
 * Write CSS variables to file
 */
export function writeCSSVariables(): void {
  const cssContent = generateCSSVariables();

  // In a real implementation, you'd write to filesystem
  // For now, we'll just log the content
  console.log('Generated CSS Variables:', cssContent);
}