import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import TopNav from './components/TopNav';
import { AppShellProps } from './types';

const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#111',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: '#aaa',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#03a9f4',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 13,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          fontSize: '0.75rem',
          borderRadius: 4,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000',
          minHeight: 48,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#222',
        },
        indicator: {
          backgroundColor: '#1976d2',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#ccc',
          '&.Mui-selected': {
            color: '#fff',
            backgroundColor: '#333',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export const AppShell: React.FC<AppShellProps> = ({
  logo,
  hamburgerMenu,
  navigation,
  children,
  theme = defaultTheme,
  onNavigate,
  currentPath,
  isDarkMode,
  onDarkModeToggle,
  username,
  avatarUrl,
  right,
  activeColor,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopNav 
          logo={logo} 
          hamburgerMenu={hamburgerMenu}
          navigation={navigation} 
          onNavigate={onNavigate}
          currentPath={currentPath}
          isDarkMode={isDarkMode}
          onDarkModeToggle={onDarkModeToggle}
          username={username}
          avatarUrl={avatarUrl}
          right={right}
          activeColor={activeColor}
        />
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppShell;