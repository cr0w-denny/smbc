import { createTheme, TypographyVariantsOptions } from "@mui/material/styles";
import { lightPalette } from "./palette";
import { baseTypography, baseSpacing, createBaseComponents } from "../base";
import { shadow, breakpoints } from "@smbc/ui-core";

// Create the base theme with light palette
const baseTheme = createTheme({
  palette: lightPalette,
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

// Create the light theme with components that can reference the theme
export const lightTheme = createTheme({
  ...baseTheme,
  components: createBaseComponents(baseTheme),
});

export default lightTheme;
