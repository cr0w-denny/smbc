import { PaletteOptions } from "@mui/material/styles";
import { ui, color } from "@smbc/ui-core";
import { token } from "../../utils/tokens";

export const createDarkPalette = (): PaletteOptions => ({
  mode: "dark",
  primary: {
    main: token(true, ui.color.brand.primary),
    light: color.cool.jadeGreen50,
    dark: color.brand.tradGreen,
    contrastText: token(true, ui.color.brand.primaryContrast),
  },
  secondary: {
    main: token(true, ui.color.brand.secondary),
    light: color.cool.jadeGreen25,
    dark: color.cool.jadeGreen100,
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
    active: "rgba(255, 255, 255, 0.54)",
    hover: token(true, ui.color.action.hover),
    selected: token(true, ui.color.action.selected),
    disabled: token(true, ui.color.action.disabled),
    disabledBackground: token(true, ui.color.action.disabledBackground),
  },
});
