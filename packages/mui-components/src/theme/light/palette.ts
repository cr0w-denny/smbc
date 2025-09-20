import { PaletteOptions } from "@mui/material/styles";
import * as ui from "@smbc/ui-core";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: ui.BrandPrimaryLight,
    light: ui.JadeGreen75,
    dark: ui.TradGreen,
    contrastText: ui.BrandPrimaryContrastLight,
  },
  secondary: {
    main: ui.BrandSecondaryLight,
    light: ui.JadeGreen50,
    dark: ui.JadeGreen100,
    contrastText: ui.BrandSecondaryContrastLight,
  },
  success: {
    main: ui.StatusSuccessLight,
    light: ui.Success100,
    dark: ui.Success700,
    contrastText: "#ffffff",
  },
  error: {
    main: ui.StatusErrorLight,
    light: ui.Error100,
    dark: ui.Error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: ui.StatusWarningLight,
    light: ui.Warning100,
    dark: ui.Warning700,
    contrastText: "#000000",
  },
  info: {
    main: ui.StatusInfoLight,
    light: ui.Info100,
    dark: ui.Info700,
    contrastText: "#ffffff",
  },
  background: {
    default: ui.BackgroundPrimaryLight,
    paper: ui.BackgroundSecondaryLight,
  },
  text: {
    primary: ui.TextPrimaryLight,
    secondary: ui.TextSecondaryLight,
    disabled: ui.TextDisabledLight,
  },
  divider: ui.BorderPrimaryLight,
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
    active: ui.TradGreen,
    hover: ui.ActionHoverLight,
    selected: ui.ActionSelectedLight,
    disabled: ui.ActionDisabledLight,
    disabledBackground: ui.ActionDisabledBackgroundLight,
  },
};
