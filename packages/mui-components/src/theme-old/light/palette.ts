import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

export const createLightPalette = (): PaletteOptions => ({
  mode: "light",
  primary: {
    main: token(false, ui.color.brand.primary),
    light: color.cool.jadeGreen75,
    dark: color.brand.tradGreen,
    contrastText: token(false, ui.color.brand.primaryContrast),
  },
  secondary: {
    main: token(false, ui.color.brand.secondary),
    light: color.cool.jadeGreen50,
    dark: color.cool.jadeGreen100,
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
    50: color.neutral.gray50,
    100: color.neutral.gray100,
    200: color.neutral.gray200,
    300: color.neutral.gray300,
    400: color.neutral.gray400,
    500: color.neutral.gray500,
    600: color.neutral.gray600,
    700: color.neutral.gray700,
    800: color.neutral.gray800,
    900: color.neutral.gray900,
  },
  action: {
    active: color.brand.tradGreen,
    hover: token(false, ui.color.action.hover),
    selected: token(false, ui.color.action.selected),
    disabled: token(false, ui.color.action.disabled),
    disabledBackground: token(false, ui.color.action.disabledBackground),
  },
});
