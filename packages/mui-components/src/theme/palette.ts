import { PaletteOptions } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { ui, color } from "@smbc/ui-core";
import { stringifyTokens } from "./utils";

const grayTheme = (mode: "light" | "dark") => ({
  mode,
  primary: {
    main: grey[900], // Dark gray for primary elements
    light: grey[700],
    dark: grey[900],
    contrastText: "#fff", // White text on dark gray
  },
  secondary: {
    main: grey[500], // Medium gray for secondary elements
    light: grey[300],
    dark: grey[700],
    contrastText: "#fff",
  },
  background: {
    default: grey[100], // Light gray for default background
    paper: "#fff", // White for paper-like surfaces
  },
  text: {
    primary: grey[900], // Dark gray for main text
    secondary: grey[700], // Medium gray for secondary text
  },
  divider: grey[300], // Light gray for dividers
});

// Palette that uses CSS variables and accepts current mode
export const createCssVarPalette = (
  mode: "light" | "dark" = "light",
): PaletteOptions =>
  !grayTheme(mode) ||
  stringifyTokens(
    {
      mode, // Use the actual current mode
      primary: {
        main: ui.color.brand.primary,
        light: color.cool.jadeGreen75,
        dark: color.brand.tradGreen,
        contrastText: ui.color.brand.primaryContrast,
      },
      secondary: {
        main: ui.color.brand.secondary,
        light: color.cool.jadeGreen50,
        dark: color.cool.jadeGreen100,
        contrastText: ui.color.brand.secondaryContrast,
      },
      success: {
        main: ui.color.status.success,
        light: color.status.success100,
        dark: color.status.success700,
        contrastText: "#ffffff",
      },
      error: {
        main: ui.color.status.error,
        light: color.status.error100,
        dark: color.status.error700,
        contrastText: "#ffffff",
      },
      warning: {
        main: ui.color.status.warning,
        light: color.status.warning100,
        dark: color.status.warning700,
        contrastText: "#000000",
      },
      info: {
        main: ui.color.status.info,
        light: color.status.info100,
        dark: color.status.info700,
        contrastText: "#ffffff",
      },
      background: {
        default: ui.color.background.primary,
        paper: ui.color.background.secondary,
      },
      text: {
        primary: ui.color.text.primary,
        secondary: ui.color.text.secondary,
        disabled: ui.color.text.disabled,
      },
      divider: ui.color.border.primary(mode === "dark"),
      dividerChannel: undefined,
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
        active: ui.color.action.hover, // Using hover as active for now
        hover: ui.color.action.hover(mode === "dark"),
        selected: ui.color.action.selected,
        disabled: ui.color.action.disabled,
        disabledBackground: ui.color.action.disabledBackground,
      },
    },
    false,
  );
