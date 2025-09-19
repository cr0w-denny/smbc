import { PaletteOptions } from "@mui/material/styles";
import { getSemanticColor, TradGreen, FreshGreen, JadeGreen100, JadeGreen75, JadeGreen50, JadeGreen25, Success400, Success100, Success700, Error400, Error100, Error700, Warning400, Warning100, Warning700, Info400, Info100, Info700, Gray50, Gray100, Gray200, Gray300, Gray400, Gray500, Gray600, Gray700, Gray800, Gray900 } from "@smbc/ui-core";

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: getSemanticColor("brand.primary", "dark") || FreshGreen,
    light: JadeGreen50,
    dark: TradGreen,
    contrastText:
      getSemanticColor("brand.primaryContrast", "dark") || "#000000",
  },
  secondary: {
    main: getSemanticColor("brand.secondary", "dark") || JadeGreen75,
    light: JadeGreen25,
    dark: JadeGreen100,
    contrastText:
      getSemanticColor("brand.secondaryContrast", "dark") || "#ffffff",
  },
  success: {
    main: getSemanticColor("status.success", "dark") || Success400,
    light: Success100,
    dark: Success700,
    contrastText: "#000000",
  },
  error: {
    main: getSemanticColor("status.error", "dark") || Error400,
    light: Error100,
    dark: Error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: getSemanticColor("status.warning", "dark") || Warning400,
    light: Warning100,
    dark: Warning700,
    contrastText: "#000000",
  },
  info: {
    main: getSemanticColor("status.info", "dark") || Info400,
    light: Info100,
    dark: Info700,
    contrastText: "#ffffff",
  },
  background: {
    default: getSemanticColor("background.primary", "dark") || "#121212",
    paper: getSemanticColor("background.secondary", "dark") || "#141b1d",
  },
  text: {
    primary:
      getSemanticColor("text.primary", "dark") || "rgba(255, 255, 255, 0.87)",
    secondary:
      getSemanticColor("text.secondary", "dark") || "rgba(255, 255, 255, 0.6)",
    disabled:
      getSemanticColor("text.disabled", "dark") || "rgba(255, 255, 255, 0.38)",
  },
  divider:
    getSemanticColor("border.primary", "dark") || "rgba(255, 255, 255, 0.12)",
  grey: {
    50: Gray50,
    100: Gray100,
    200: Gray200,
    300: Gray300,
    400: Gray400,
    500: Gray500,
    600: Gray600,
    700: Gray700,
    800: Gray800,
    900: Gray900,
  },
  action: {
    active: "rgba(255, 255, 255, 0.54)",
    hover:
      getSemanticColor("action.hover", "dark") || "rgba(255, 255, 255, 0.08)",
    selected:
      getSemanticColor("action.selected", "dark") ||
      "rgba(255, 255, 255, 0.12)",
    disabled:
      getSemanticColor("action.disabled", "dark") ||
      "rgba(255, 255, 255, 0.26)",
    disabledBackground:
      getSemanticColor("action.disabledBackground", "dark") ||
      "rgba(255, 255, 255, 0.12)",
  },
};
