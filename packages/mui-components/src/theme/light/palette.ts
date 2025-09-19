import { PaletteOptions } from "@mui/material/styles";
import { getSemanticColor, TradGreen, JadeGreen100, JadeGreen75, JadeGreen50, Success500, Success100, Success700, Error500, Error100, Error700, Warning500, Warning100, Warning700, Info500, Info100, Info700, Gray100, Gray900, Gray600, Gray400, Gray300, Gray50, Gray200, Gray500, Gray700, Gray800 } from "@smbc/ui-core";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: getSemanticColor("brand.primary", "light") || TradGreen,
    light: JadeGreen75,
    dark: TradGreen,
    contrastText:
      getSemanticColor("brand.primaryContrast", "light") || "#ffffff",
  },
  secondary: {
    main: getSemanticColor("brand.secondary", "light") || JadeGreen100,
    light: JadeGreen50,
    dark: JadeGreen100,
    contrastText:
      getSemanticColor("brand.secondaryContrast", "light") || "#ffffff",
  },
  success: {
    main: getSemanticColor("status.success", "light") || Success500,
    light: Success100,
    dark: Success700,
    contrastText: "#ffffff",
  },
  error: {
    main: getSemanticColor("status.error", "light") || Error500,
    light: Error100,
    dark: Error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: getSemanticColor("status.warning", "light") || Warning500,
    light: Warning100,
    dark: Warning700,
    contrastText: "#000000",
  },
  info: {
    main: getSemanticColor("status.info", "light") || Info500,
    light: Info100,
    dark: Info700,
    contrastText: "#ffffff",
  },
  background: {
    default:
      getSemanticColor("background.primary", "light") || Gray100,
    paper: getSemanticColor("background.secondary", "light") || "#ffffff",
  },
  text: {
    primary: getSemanticColor("text.primary", "light") || Gray900,
    secondary: getSemanticColor("text.secondary", "light") || Gray600,
    disabled: getSemanticColor("text.disabled", "light") || Gray400,
  },
  divider: getSemanticColor("border.primary", "light") || Gray300,
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
    active: TradGreen,
    hover: getSemanticColor("action.hover", "light") || "rgba(51, 85, 0, 0.04)",
    selected:
      getSemanticColor("action.selected", "light") || "rgba(51, 85, 0, 0.08)",
    disabled:
      getSemanticColor("action.disabled", "light") || "rgba(0, 0, 0, 0.26)",
    disabledBackground:
      getSemanticColor("action.disabledBackground", "light") ||
      "rgba(0, 0, 0, 0.12)",
  },
};
