import { createTheme, TypographyVariantsOptions } from "@mui/material/styles";
import { createCssVarComponents } from "./components";
import { baseTypography, baseSpacing } from "./typography";
import { shadow, breakpoints } from "@smbc/ui-core";

// Theme factory that creates theme based on current mode
export const createCssVarTheme = (mode: "light" | "dark" = "light") => {
  // Create the base theme with current mode
  const baseTheme = createTheme({
    cssVariables: {
      colorSchemeSelector: "[data-theme=%s]",
    },
    palette: { mode },
    typography: baseTypography as TypographyVariantsOptions,
    spacing: baseSpacing,
    breakpoints: {
      values: {
        xs: parseInt(breakpoints.xs()),
        sm: parseInt(breakpoints.sm()),
        md: parseInt(breakpoints.md()),
        lg: parseInt(breakpoints.lg()),
        xl: parseInt(breakpoints.xl()),
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

  return createTheme({
    ...baseTheme,
    cssVariables: {
      colorSchemeSelector: "[data-theme=%s]",
    },
    defaultColorScheme: "light",
    components: createCssVarComponents(baseTheme),
  });
};
