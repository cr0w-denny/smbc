import { PaletteOptions } from "@mui/material/styles";
import { color } from "@smbc/ui-core";
import { ui } from "./tokens-proxy";

// Single palette that uses CSS variables with sweet proxy syntax
export const createCssVarPalette = (): PaletteOptions => ({
  mode: "light", // This is just a default, CSS variables handle the actual theming
  primary: {
    main: ui.color.brand.primary,          // toString() → "var(--ui-color-brand-primary)"
    light: color.secondary.jadeGreen75,
    dark: color.brand.primary.tradGreen,
    contrastText: ui.color.brand.primaryContrast, // toString() → "var(--ui-color-brand-primaryContrast)"
  },
  secondary: {
    main: `${ui.color.brand.secondary}`,
    light: color.secondary.jadeGreen50,
    dark: color.secondary.jadeGreen100,
    contrastText: `${ui.color.brand.secondaryContrast}`,
  },
  success: {
    main: `${ui.color.status.success}`,
    light: color.status.success100,
    dark: color.status.success700,
    contrastText: "#ffffff",
  },
  error: {
    main: `${ui.color.status.error}`,
    light: color.status.error100,
    dark: color.status.error700,
    contrastText: "#ffffff",
  },
  warning: {
    main: `${ui.color.status.warning}`,
    light: color.status.warning100,
    dark: color.status.warning700,
    contrastText: "#000000",
  },
  info: {
    main: `${ui.color.status.info}`,
    light: color.status.info100,
    dark: color.status.info700,
    contrastText: "#ffffff",
  },
  background: {
    default: `${ui.color.background.primary}`,
    paper: `${ui.color.background.secondary}`,
  },
  text: {
    primary: `${ui.color.text.primary}`,
    secondary: `${ui.color.text.secondary}`,
    disabled: `${ui.color.text.disabled}`,
  },
  divider: `${ui.color.border.primary}`,
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
    active: `${ui.color.action.active}`,
    hover: `${ui.color.action.hover}`,
    selected: `${ui.color.action.selected}`,
    disabled: `${ui.color.action.disabled}`,
    disabledBackground: `${ui.color.action.disabled}`, // mock - would have separate token
  },
});