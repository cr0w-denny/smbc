import { Theme } from '@mui/material/styles';

/**
 * Helper to get the right token value based on theme mode
 * @param themeOrIsDark - MUI theme object or boolean indicating dark mode
 * @param tokenPath - Token object with light/dark values (flattened)
 * @returns The appropriate token value for the current theme
 */
export function token(themeOrIsDark: Theme | boolean, tokenPath: { light: string, dark: string }): string {
  const isDark = typeof themeOrIsDark === 'boolean' ? themeOrIsDark : themeOrIsDark.palette.mode === 'dark';
  return isDark ? tokenPath.dark : tokenPath.light;
}

/**
 * Curried version for use in MUI sx prop where theme is automatically provided
 * @param tokenPath - Token object with light/dark values (flattened)
 * @returns Function that takes theme and returns the appropriate token value
 *
 * @example
 * sx={{
 *   color: t(ui.color.text.primary),
 *   backgroundColor: t(ui.color.background.primary)
 * }}
 */
export function t(tokenPath: { light: string, dark: string }) {
  return (theme: Theme) => token(theme, tokenPath);
}

// Re-export for convenience
export default token;