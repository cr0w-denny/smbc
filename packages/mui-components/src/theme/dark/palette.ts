import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

export const createDarkPalette = (): PaletteOptions => ({
  mode: "dark",
  primary: {
    main: token(true, ui.color.brand.primary),
    light: color.secondary.jadeGreen50,
    dark: color.brand.primary.tradGreen,
    contrastText: token(true, ui.color.brand.primaryContrast),
  },
  secondary: {
    main: token(true, ui.color.brand.secondary),
    light: color.secondary.jadeGreen25,
    dark: color.secondary.jadeGreen100,
    contrastText: token(true, ui.color.brand.secondaryContrast),
  },
  success: {
    main: token(true, ui.color.status.success),
    light: color.status.success100,
    dark: color.status.success700,
    contrastText: "#000000",
  },
  error: {
    main: token(true, ui.color.status.error),
    light: color.status.error100,
    dark: color.status.error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: token(true, ui.color.status.warning),
    light: color.status.warning100,
    dark: color.status.warning700,
    contrastText: "#000000",
  },
  info: {
    main: token(true, ui.color.status.info),
    light: color.status.info100,
    dark: color.status.info700,
    contrastText: "#ffffff",
  },
  background: {
    default: token(true, ui.color.background.primary),
    paper: token(true, ui.color.background.secondary),
  },
  text: {
    primary: token(true, ui.color.text.primary),
    secondary: token(true, ui.color.text.secondary),
    disabled: token(true, ui.color.text.disabled),
  },
  divider: token(true, ui.color.border.primary),
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
    hover: token(true, ui.color.action.hover),
    selected: token(true, ui.color.action.selected),
    disabled: token(true, ui.color.action.disabled),
    disabledBackground: token(true, ui.color.action.disabledBackground),
  },
});
