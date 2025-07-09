import { createTheme, TypographyVariantsOptions } from "@mui/material/styles";
import { lightPalette } from "./palette";
import { baseTypography, baseSpacing, createBaseComponents } from "../base";
import { shadows, breakpoints } from "@smbc/ui-core";

// Create the base theme with light palette
const baseTheme = createTheme({
  palette: lightPalette,
  typography: baseTypography as TypographyVariantsOptions,
  spacing: baseSpacing,
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
});

// Create the light theme with components that can reference the theme
export const lightTheme = createTheme({
  ...baseTheme,
  components: createBaseComponents(baseTheme),
});

export default lightTheme;
