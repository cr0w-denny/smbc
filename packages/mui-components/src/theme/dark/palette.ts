import { PaletteOptions } from '@mui/material/styles';
import { colors, getSemanticColor } from '@smbc/design-tokens';

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: getSemanticColor('brand.primary', 'dark') || colors.primary[400],
    light: colors.primary[300],
    dark: colors.primary[600],
    contrastText: getSemanticColor('brand.primaryContrast', 'dark') || '#000000',
  },
  secondary: {
    main: getSemanticColor('brand.secondary', 'dark') || colors.secondary[400],
    light: colors.secondary[300],
    dark: colors.secondary[600],
    contrastText: getSemanticColor('brand.secondaryContrast', 'dark') || '#000000',
  },
  success: {
    main: getSemanticColor('status.success', 'dark') || colors.success[400],
    light: colors.success[200],
    dark: colors.success[600],
    contrastText: '#000000',
  },
  error: {
    main: getSemanticColor('status.error', 'dark') || colors.error[400],
    light: colors.error[200],
    dark: colors.error[600],
    contrastText: '#ffffff',
  },
  warning: {
    main: getSemanticColor('status.warning', 'dark') || colors.warning[400],
    light: colors.warning[200],
    dark: colors.warning[600],
    contrastText: '#000000',
  },
  info: {
    main: getSemanticColor('status.info', 'dark') || colors.info[400],
    light: colors.info[200],
    dark: colors.info[600],
    contrastText: '#ffffff',
  },
  background: {
    default: getSemanticColor('background.primary', 'dark') || '#121212',
    paper: getSemanticColor('background.secondary', 'dark') || '#1e1e1e',
  },
  text: {
    primary: getSemanticColor('text.primary', 'dark') || 'rgba(255, 255, 255, 0.87)',
    secondary: getSemanticColor('text.secondary', 'dark') || 'rgba(255, 255, 255, 0.6)',
    disabled: getSemanticColor('text.disabled', 'dark') || 'rgba(255, 255, 255, 0.38)',
  },
  divider: getSemanticColor('border.primary', 'dark') || 'rgba(255, 255, 255, 0.12)',
  grey: {
    50: '#fafafa',
    100: '#f5f5f5', 
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  action: {
    active: 'rgba(255, 255, 255, 0.54)',
    hover: getSemanticColor('action.hover', 'dark') || 'rgba(255, 255, 255, 0.08)',
    selected: getSemanticColor('action.selected', 'dark') || 'rgba(255, 255, 255, 0.12)',
    disabled: getSemanticColor('action.disabled', 'dark') || 'rgba(255, 255, 255, 0.26)',
    disabledBackground: getSemanticColor('action.disabledBackground', 'dark') || 'rgba(255, 255, 255, 0.12)',
  },
};