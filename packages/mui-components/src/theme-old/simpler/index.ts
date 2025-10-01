import { createTheme, TypographyVariantsOptions } from "@mui/material/styles";
import { createCssVarPalette } from "./palette";
import { createCssVarComponents } from "./components";
import { baseTypography, baseSpacing } from "../base";
import { shadow, breakpoints } from "@smbc/ui-core";

// Re-export types and utilities
export { ui, type UITokens } from "./tokens-proxy";
export * from "./utils";

// Single theme that works for both light and dark modes via CSS variables
export const createCssVarTheme = () => {
  // Create the base theme
  const baseTheme = createTheme({
    palette: createCssVarPalette(),
    typography: baseTypography as TypographyVariantsOptions,
    spacing: baseSpacing,
    breakpoints: {
      values: {
        xs: parseInt(breakpoints.xs),
        sm: parseInt(breakpoints.sm),
        md: parseInt(breakpoints.md),
        lg: parseInt(breakpoints.lg),
        xl: parseInt(breakpoints.xl),
      },
    },
    shadows: [
      "none",
      shadow?.sm || "none",
      shadow?.base || "none",
      shadow?.md || "none",
      shadow?.lg || "none",
      shadow?.xl || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
      shadow?.["2xl"] || "none",
    ],
  });

  // Create the final theme with components
  return createTheme({
    ...baseTheme,
    components: createCssVarComponents(baseTheme),
  });
};

// Export a single theme instance
export const cssVarTheme = createCssVarTheme();

export default cssVarTheme;