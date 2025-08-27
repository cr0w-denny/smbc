import { createTheme as muiCreateTheme, TypographyVariantsOptions, ThemeOptions } from "@mui/material/styles";
import { lightPalette } from "../light/palette";
import { darkPalette } from "../dark/palette";
import { shadows, breakpoints } from "@smbc/ui-core";
import { baseTypography } from "./typography";
import { baseSpacing } from "./spacing";
import { createBaseComponents } from "./components";

export { baseTypography } from "./typography";
export { baseSpacing } from "./spacing";
export { createBaseComponents } from "./components";

/**
 * Creates a complete theme with app-specific overrides merged into the base theme
 * @param isDarkMode - Whether to use dark or light mode
 * @param appOverrides - App-specific theme overrides to merge
 * @returns Complete theme with app overrides merged
 */
export const createTheme = (
  isDarkMode: boolean = false,
  appOverrides: ThemeOptions = {}
) => {
  const palette = isDarkMode ? darkPalette : lightPalette;
  
  // Create base theme with palette
  const baseTheme = muiCreateTheme({
    palette,
    typography: baseTypography as TypographyVariantsOptions,
    spacing: baseSpacing,
    shape: {
      borderRadius: 24, // spacing(3) = 3 * 8px = 24px
    },
    breakpoints: {
      values: {
        xs: parseInt(breakpoints.Xs),
        sm: parseInt(breakpoints.Sm),
        md: parseInt(breakpoints.Md),
        lg: parseInt(breakpoints.Lg),
        xl: parseInt(breakpoints.Xl),
      },
    },
    shadows: [
      "none",
      shadows?.sm || "none",
      shadows?.base || "none",
      shadows?.md || "none",
      shadows?.lg || "none",
      shadows?.xl || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
      shadows?.["2xl"] || "none",
    ],
    ...appOverrides,
  });

  // Create final theme with base components + app component overrides
  const baseComponents = createBaseComponents(baseTheme);
  const mergedComponents = { ...baseComponents };
  
  // Deep merge app component overrides with base components
  if (appOverrides.components) {
    for (const [componentName, componentOverride] of Object.entries(appOverrides.components)) {
      const existingComponent = mergedComponents[componentName as keyof typeof mergedComponents];
      
      if (existingComponent && typeof existingComponent === 'object' && typeof componentOverride === 'object') {
        // Merge styleOverrides if both exist
        mergedComponents[componentName as keyof typeof mergedComponents] = {
          ...(existingComponent as any),
          styleOverrides: {
            ...(existingComponent as any).styleOverrides,
            ...(componentOverride as any)?.styleOverrides,
          },
        };
      } else {
        // Add new component override
        mergedComponents[componentName as keyof typeof mergedComponents] = componentOverride;
      }
    }
  }

  return muiCreateTheme({
    ...baseTheme,
    components: mergedComponents,
  });
};
