import { createTheme } from '@mui/material/styles';
import { designTokens } from '@smbc/design-tokens';

export const smbcTheme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.primary[700],
      light: designTokens.colors.primary[400],
      dark: designTokens.colors.primary[800],
    },
    secondary: {
      main: designTokens.colors.secondary[600],
      light: designTokens.colors.secondary[400],
      dark: designTokens.colors.secondary[800],
    },
    background: {
      default: designTokens.colors.gray[100],
      paper: '#ffffff',
    },
    success: {
      main: designTokens.colors.success[500],
      light: designTokens.colors.success[100],
      dark: designTokens.colors.success[700],
    },
    warning: {
      main: designTokens.colors.warning[500],
      light: designTokens.colors.warning[100], 
      dark: designTokens.colors.warning[700],
    },
    error: {
      main: designTokens.colors.error[500],
      light: designTokens.colors.error[100],
      dark: designTokens.colors.error[700],
    },
    info: {
      main: designTokens.colors.info[500],
      light: designTokens.colors.info[100],
      dark: designTokens.colors.info[700],
    },
    grey: {
      50: designTokens.colors.gray[50],
      100: designTokens.colors.gray[100],
      200: designTokens.colors.gray[200],
      300: designTokens.colors.gray[300],
      400: designTokens.colors.gray[400],
      500: designTokens.colors.gray[500],
      600: designTokens.colors.gray[600],
      700: designTokens.colors.gray[700],
      800: designTokens.colors.gray[800],
      900: designTokens.colors.gray[900],
    },
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily.primary,
    h1: {
      fontSize: designTokens.typography.fontSize['5xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    h2: {
      fontSize: designTokens.typography.fontSize['4xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    h3: {
      fontSize: designTokens.typography.fontSize['3xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    h4: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    h5: {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    h6: {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.medium,
    },
    body1: {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.normal,
    },
    body2: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
    },
  },
  shape: {
    borderRadius: parseInt(designTokens.borderRadius.lg),
  },
  spacing: parseInt(designTokens.spacing[1]),
  breakpoints: {
    values: {
      xs: parseInt(designTokens.breakpoints.xs),
      sm: parseInt(designTokens.breakpoints.sm),
      md: parseInt(designTokens.breakpoints.md),
      lg: parseInt(designTokens.breakpoints.lg),
      xl: parseInt(designTokens.breakpoints.xl),
    },
  },
  shadows: [
    'none',
    designTokens.shadows.sm,
    designTokens.shadows.base,
    designTokens.shadows.md,
    designTokens.shadows.lg,
    designTokens.shadows.xl,
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
    designTokens.shadows['2xl'],
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: designTokens.borderRadius.lg,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.xl,
          boxShadow: designTokens.shadows.base,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
        },
      },
    },
  },
});
