import { PaletteOptions } from "@mui/material/styles";
import * as ui from "@smbc/ui-core";

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: ui.BrandPrimaryDark,
    light: ui.JadeGreen50,
    dark: ui.TradGreen,
    contrastText: ui.BrandPrimaryContrastDark,
  },
  secondary: {
    main: ui.BrandSecondaryDark,
    light: ui.JadeGreen25,
    dark: ui.JadeGreen100,
    contrastText: ui.BrandSecondaryContrastDark,
  },
  success: {
    main: ui.StatusSuccessDark,
    light: ui.Success100,
    dark: ui.Success700,
    contrastText: "#000000",
  },
  error: {
    main: ui.StatusErrorDark,
    light: ui.Error100,
    dark: ui.Error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: ui.StatusWarningDark,
    light: ui.Warning100,
    dark: ui.Warning700,
    contrastText: "#000000",
  },
  info: {
    main: ui.StatusInfoDark,
    light: ui.Info100,
    dark: ui.Info700,
    contrastText: "#ffffff",
  },
  background: {
    default: ui.BackgroundPrimaryDark,
    paper: ui.BackgroundSecondaryDark,
  },
  text: {
    primary: ui.TextPrimaryDark,
    secondary: ui.TextSecondaryDark,
    disabled: ui.TextDisabledDark,
  },
  divider: ui.BorderPrimaryDark,
  grey: {
    50: ui.Gray50,
    100: ui.Gray100,
    200: ui.Gray200,
    300: ui.Gray300,
    400: ui.Gray400,
    500: ui.Gray500,
    600: ui.Gray600,
    700: ui.Gray700,
    800: ui.Gray800,
    900: ui.Gray900,
  },
  action: {
    active: "rgba(255, 255, 255, 0.54)",
    hover: ui.ActionHoverDark,
    selected: ui.ActionSelectedDark,
    disabled: ui.ActionDisabledDark,
    disabledBackground: ui.ActionDisabledBackgroundDark,
  },
};
