import { colors, getSemanticColor } from '@smbc/design-tokens';
export const lightPalette = {
    mode: 'light',
    primary: {
        main: getSemanticColor('brand.primary', 'light') || colors.primary[500],
        light: colors.primary[300],
        dark: colors.primary[700],
        contrastText: getSemanticColor('brand.primaryContrast', 'light') || '#ffffff',
    },
    secondary: {
        main: getSemanticColor('brand.secondary', 'light') || colors.secondary[500],
        light: colors.secondary[300],
        dark: colors.secondary[700],
        contrastText: getSemanticColor('brand.secondaryContrast', 'light') || '#000000',
    },
    success: {
        main: getSemanticColor('status.success', 'light') || colors.success[500],
        light: colors.success[100],
        dark: colors.success[700],
        contrastText: '#ffffff',
    },
    error: {
        main: getSemanticColor('status.error', 'light') || colors.error[500],
        light: colors.error[100],
        dark: colors.error[700],
        contrastText: '#ffffff',
    },
    warning: {
        main: getSemanticColor('status.warning', 'light') || colors.warning[500],
        light: colors.warning[100],
        dark: colors.warning[700],
        contrastText: '#000000',
    },
    info: {
        main: getSemanticColor('status.info', 'light') || colors.info[500],
        light: colors.info[100],
        dark: colors.info[700],
        contrastText: '#ffffff',
    },
    background: {
        default: getSemanticColor('background.primary', 'light') || colors.gray[100],
        paper: getSemanticColor('background.secondary', 'light') || '#ffffff',
    },
    text: {
        primary: getSemanticColor('text.primary', 'light') || colors.gray[900],
        secondary: getSemanticColor('text.secondary', 'light') || colors.gray[600],
        disabled: getSemanticColor('text.disabled', 'light') || colors.gray[400],
    },
    divider: getSemanticColor('border.primary', 'light') || colors.gray[300],
    grey: {
        50: colors.gray[50],
        100: colors.gray[100],
        200: colors.gray[200],
        300: colors.gray[300],
        400: colors.gray[400],
        500: colors.gray[500],
        600: colors.gray[600],
        700: colors.gray[700],
        800: colors.gray[800],
        900: colors.gray[900],
    },
    action: {
        active: colors.primary[700],
        hover: getSemanticColor('action.hover', 'light') || 'rgba(51, 85, 0, 0.04)',
        selected: getSemanticColor('action.selected', 'light') || 'rgba(51, 85, 0, 0.08)',
        disabled: getSemanticColor('action.disabled', 'light') || 'rgba(0, 0, 0, 0.26)',
        disabledBackground: getSemanticColor('action.disabledBackground', 'light') || 'rgba(0, 0, 0, 0.12)',
    },
};
