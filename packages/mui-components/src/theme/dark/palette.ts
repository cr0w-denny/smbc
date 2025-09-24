import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: ui.color.brand.primary.dark,
    light: color.secondary.jadeGreen50,
    dark: color.brand.primary.tradGreen,
    contrastText: ui.color.brand.primaryContrast.dark,
  },
  secondary: {
    main: ui.color.brand.secondary.dark,
    light: color.secondary.jadeGreen25,
    dark: color.secondary.jadeGreen100,
    contrastText: ui.color.brand.secondaryContrast.dark,
  },
  success: {
    main: ui.color.status.success.dark,
    light: color.status.success100,
    dark: color.status.success700,
    contrastText: "#000000",
  },
  error: {
    main: ui.color.status.error.dark,
    light: color.status.error100,
    dark: color.status.error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: ui.color.status.warning.dark,
    light: color.status.warning100,
    dark: color.status.warning700,
    contrastText: "#000000",
  },
  info: {
    main: ui.color.status.info.dark,
    light: color.status.info100,
    dark: color.status.info700,
    contrastText: "#ffffff",
  },
  background: {
    default: ui.color.background.primary.dark,
    paper: ui.color.background.secondary.dark,
  },
  text: {
    primary: ui.color.text.primary.dark,
    secondary: ui.color.text.secondary.dark,
    disabled: ui.color.text.disabled.dark,
  },
  divider: ui.color.border.primary.dark,
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
    active: "rgba(255, 255, 255, 0.54)",
    hover: ui.color.action.hover.dark,
    selected: ui.color.action.selected.dark,
    disabled: ui.color.action.disabled.dark,
    disabledBackground: ui.color.action.disabledBackground.dark,
  },
};
