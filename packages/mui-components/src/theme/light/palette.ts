import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: ui.color.brand.primary.light,
    light: color.secondary.jadeGreen75,
    dark: color.brand.primary.tradGreen,
    contrastText: ui.color.brand.primaryContrast.light,
  },
  secondary: {
    main: ui.color.brand.secondary.light,
    light: color.secondary.jadeGreen50,
    dark: color.secondary.jadeGreen100,
    contrastText: ui.color.brand.secondaryContrast.light,
  },
  success: {
    main: ui.color.status.success.light,
    light: color.status.success100,
    dark: color.status.success700,
    contrastText: "#ffffff",
  },
  error: {
    main: ui.color.status.error.light,
    light: color.status.error100,
    dark: color.status.error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: ui.color.status.warning.light,
    light: color.status.warning100,
    dark: color.status.warning700,
    contrastText: "#000000",
  },
  info: {
    main: ui.color.status.info.light,
    light: color.status.info100,
    dark: color.status.info700,
    contrastText: "#ffffff",
  },
  background: {
    default: ui.color.background.primary.light,
    paper: ui.color.background.secondary.light,
  },
  text: {
    primary: ui.color.text.primary.light,
    secondary: ui.color.text.secondary.light,
    disabled: ui.color.text.disabled.light,
  },
  divider: ui.color.border.primary.light,
  grey: {
    50: color.gray50,
    100: color.gray100,
    200: color.gray200,
    300: color.gray300,
    400: color.gray400,
    500: color.gray500,
    600: color.gray600,
    700: color.gray700,
    800: color.gray800,
    900: color.gray900,
  },
  action: {
    active: color.brand.primary.tradGreen,
    hover: ui.color.action.hover.light,
    selected: ui.color.action.selected.light,
    disabled: ui.color.action.disabled.light,
    disabledBackground: ui.color.action.disabledBackground.light,
  },
};
