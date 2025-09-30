import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

export const createLightPalette = (): PaletteOptions => ({
  mode: "light",
  primary: {
    main: token(false, ui.color.brand.primary),
    light: color.secondary.jadeGreen75,
    dark: color.brand.primary.tradGreen,
    contrastText: token(false, ui.color.brand.primaryContrast),
  },
  secondary: {
    main: token(false, ui.color.brand.secondary),
    light: color.secondary.jadeGreen50,
    dark: color.secondary.jadeGreen100,
    contrastText: token(false, ui.color.brand.secondaryContrast),
  },
  success: {
    main: token(false, ui.color.status.success),
    light: color.status.success100,
    dark: color.status.success700,
    contrastText: "#ffffff",
  },
  error: {
    main: token(false, ui.color.status.error),
    light: color.status.error100,
    dark: color.status.error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: token(false, ui.color.status.warning),
    light: color.status.warning100,
    dark: color.status.warning700,
    contrastText: "#000000",
  },
  info: {
    main: token(false, ui.color.status.info),
    light: color.status.info100,
    dark: color.status.info700,
    contrastText: "#ffffff",
  },
  background: {
    default: token(false, ui.color.background.primary),
    paper: token(false, ui.color.background.secondary),
  },
  text: {
    primary: token(false, ui.color.text.primary),
    secondary: token(false, ui.color.text.secondary),
    disabled: token(false, ui.color.text.disabled),
  },
  divider: token(false, ui.color.border.primary),
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
    hover: token(false, ui.color.action.hover),
    selected: token(false, ui.color.action.selected),
    disabled: token(false, ui.color.action.disabled),
    disabledBackground: token(false, ui.color.action.disabledBackground),
  },
});
