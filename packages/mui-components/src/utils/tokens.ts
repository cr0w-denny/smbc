import { Theme } from '@mui/material/styles';
import { resolveTokenReference } from '@smbc/ui-core';

/**
 * Helper to get the right token value based on theme mode
 * @param themeOrIsDark - MUI theme object or boolean indicating dark mode
 * @param tokenPath - Token object with light/dark values OR a simple string value
 * @returns The appropriate token value for the current theme
 */
export function token(themeOrIsDark: Theme | boolean, tokenPath: { light: string, dark: string } | string): string {
  // If it's a simple string, resolve any token references and return
  if (typeof tokenPath === 'string') {
    return resolveTokenReference(tokenPath);
  }

  const isDark = typeof themeOrIsDark === 'boolean' ? themeOrIsDark : themeOrIsDark.palette.mode === 'dark';

  // Defensive error handling for undefined token paths
  if (!tokenPath) {
    console.error('Token path is undefined:', tokenPath);
    return '#ff0000'; // Bright red to make missing tokens obvious
  }

  if (!tokenPath.light || !tokenPath.dark) {
    console.error('Token path missing light/dark values:', tokenPath);
    return '#ff0000'; // Bright red to make missing tokens obvious
  }

  const selectedValue = isDark ? tokenPath.dark : tokenPath.light;
  return resolveTokenReference(selectedValue);
}

/**
 * Curried version for use in MUI sx prop where theme is automatically provided
 * @param tokenPath - Token object with light/dark values OR a simple string value
 * @returns Function that takes theme and returns the appropriate token value
 *
 * @example
 * sx={{
 *   color: t(ui.color.text.primary),
 *   backgroundColor: t(color.brand.primary.tradGreen)
 * }}
 */
export function t(tokenPath: { light: string, dark: string } | string) {
  return (theme: Theme) => {
    // If it's a simple string, resolve any token references and return
    if (typeof tokenPath === 'string') {
      return resolveTokenReference(tokenPath);
    }
    // Otherwise use the normal token function
    return token(theme, tokenPath);
  };
}

// Re-export for convenience
export default token;