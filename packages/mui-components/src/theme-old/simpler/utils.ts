// Utility functions for working with CSS variable themes

/**
 * Update CSS custom properties dynamically
 * @param overrides - Object with CSS variable names (without --) and values
 * @param isDark - Whether to apply to dark mode selector
 */
export function updateCssVars(overrides: Record<string, string>, isDark = false) {
  const root = isDark ?
    document.querySelector('[data-theme="dark"]') || document.documentElement :
    document.documentElement;

  Object.entries(overrides).forEach(([key, value]) => {
    const cssVar = key.startsWith('--') ? key : `--${key}`;
    (root as HTMLElement).style.setProperty(cssVar, value);
  });
}

/**
 * Convert token path to CSS variable name
 * @param path - Dot notation path like "ui.input.base.default.background"
 * @returns CSS variable name like "--ui-input-base-default-background"
 */
export function pathToCssVar(path: string): string {
  return `--${path.replace(/\./g, '-')}`;
}

/**
 * Get current CSS variable value
 * @param varName - CSS variable name (with or without --)
 * @param isDark - Whether to check dark mode value
 * @returns Current CSS variable value
 */
export function getCssVarValue(varName: string, isDark = false): string {
  const root = isDark ?
    document.querySelector('[data-theme="dark"]') || document.documentElement :
    document.documentElement;

  const cssVar = varName.startsWith('--') ? varName : `--${varName}`;
  return getComputedStyle(root as Element).getPropertyValue(cssVar).trim();
}

/**
 * Set theme mode by adding/removing data-theme attribute
 * @param isDark - Whether to enable dark mode
 */
export function setThemeMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Get current theme mode
 * @returns true if dark mode is active
 */
export function getThemeMode(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Apply token overrides as CSS variables
 * @param overrides - Token overrides object like { "ui.input.base.default.background": "#ff0000" }
 * @param isDark - Whether to apply to dark mode
 */
export function applyTokenOverrides(overrides: Record<string, string>, isDark = false) {
  const cssVarOverrides: Record<string, string> = {};

  Object.entries(overrides).forEach(([path, value]) => {
    cssVarOverrides[pathToCssVar(path)] = value;
  });

  updateCssVars(cssVarOverrides, isDark);
}