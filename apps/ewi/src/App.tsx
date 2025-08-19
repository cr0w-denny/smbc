import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppShell, lightTheme, darkTheme } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import {
  useHashNavigation,
  AppletProvider,
  FeatureFlagProvider,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS } from "./applet.config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

configureApplets(APPLETS);
console.log("🔄 Configured applets for mock environment");

const borderRadius = darkTheme.spacing(3);
const bgColor = "#121212";
const bodyBgColor = "#1a1a1a";
const main = "#42A5F5";
const inputStyles = {
  backgroundColor: bgColor,
  borderRadius,
};

const AppContent: React.FC = () => {
  const { path, navigate } = useHashNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ewi-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem("ewi-dark-mode", JSON.stringify(enabled));
  };

  // App theme - always dark (used by header and filter areas)
  const appTheme = React.useMemo(() => {
    return createTheme({
      ...darkTheme,
      palette: {
        ...darkTheme.palette,
        primary: {
          ...darkTheme.palette.primary,
          main,
        },
      },
      shape: {
        ...darkTheme.shape,
        borderRadius,
      },
      components: {
        ...darkTheme.components,
        MuiChip: {
          styleOverrides: {
            root: {
              height: 24,
              fontSize: "0.75rem",
              borderRadius: 4,
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              backgroundColor: bgColor,
              minHeight: 70,
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              backgroundColor: "#222",
            },
            indicator: {
              backgroundColor: main,
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              color: "#ccc",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "#333",
              },
            },
          },
        },
        // Body background
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: bodyBgColor,
            },
          },
        },
        // Input components
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              ...inputStyles,
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius,
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: inputStyles,
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiInputBase-root, & .MuiOutlinedInput-root": inputStyles,
            },
          },
        },
        MuiFormControl: {
          styleOverrides: {
            root: {
              "&.MuiPickersTextField-root": {
                "& .MuiInputBase-root, & .MuiOutlinedInput-root": inputStyles,
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: inputStyles,
          },
        },
        // @ts-ignore
        MuiPickersInputBase: {
          styleOverrides: {
            root: {
              ...inputStyles,
              "&.MuiPickersOutlinedInput-root": inputStyles,
              "& .MuiIconButton-root": {
                color: main,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 500,
              borderRadius,
              "&.Mui-disabled": {
                backgroundColor: "transparent !important",
                color: "rgba(255, 255, 255, 0.3) !important",
              },
            },
            contained: {
              background: "linear-gradient(135deg, #1565C0, #42A5F5)",
              color: "#ffffff",
              border: `1px solid ${main}`,
              "&:hover": {
                background: "linear-gradient(135deg, #0B3D91, #2196F3)",
              },
              "&.Mui-disabled": {
                background: "rgba(255, 255, 255, 0.12) !important",
                color: "rgba(255, 255, 255, 0.3) !important",
              },
            },
          },
        },
      },
    });
  }, []);

  // Content theme - varies based on isDarkMode toggle
  const appletTheme = React.useMemo(() => {
    const baseTheme = isDarkMode ? darkTheme : lightTheme;
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        background: {
          ...baseTheme.palette.background,
          default: isDarkMode
            ? bodyBgColor
            : baseTheme.palette.background.default,
          paper: isDarkMode ? "#222" : baseTheme.palette.background.paper,
        },
      },
      shape: {
        ...baseTheme.shape,
        borderRadius: baseTheme.spacing(3),
      },
      components: {
        ...baseTheme.components,
        // Scrollbar styling for DataView and other content areas (only in dark mode)
        ...(isDarkMode && {
          MuiCssBaseline: {
            styleOverrides: {
              "*": {
                scrollbarColor: "#555 #2a2a2a",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "10px",
                  height: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#2a2a2a",
                  borderRadius: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#555",
                  borderRadius: "5px",
                  border: "1px solid #2a2a2a",
                  "&:hover": {
                    backgroundColor: "#666",
                  },
                },
                "&::-webkit-scrollbar-corner": {
                  backgroundColor: "#2a2a2a",
                },
              },
            },
          },
        }),
        MuiOutlinedInput: {
          ...baseTheme.components?.MuiOutlinedInput,
          styleOverrides: {
            ...baseTheme.components?.MuiOutlinedInput?.styleOverrides,
            root: {
              ...((baseTheme.components?.MuiOutlinedInput?.styleOverrides
                ?.root as any) || {}),
              borderRadius: baseTheme.spacing(3),
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: baseTheme.spacing(3),
              },
            },
          },
        },
        MuiButton: {
          ...baseTheme.components?.MuiButton,
          styleOverrides: {
            ...baseTheme.components?.MuiButton?.styleOverrides,
            root: {
              ...((baseTheme.components?.MuiButton?.styleOverrides
                ?.root as any) || {}),
              borderRadius: baseTheme.spacing(3),
              "&.Mui-disabled": {
                backgroundColor: "transparent !important",
                color: "rgba(0, 0, 0, 0.26) !important",
              },
            },
            contained: {
              "&.Mui-disabled": {
                backgroundColor: "transparent !important",
                color: "rgba(0, 0, 0, 0.26) !important",
              },
            },
          },
        },
      },
    });
  }, [isDarkMode]);

  // Simple direct navigation structure
  const navigation = [
    { label: "Events Dashboard", type: "link" as const, href: "/ewi-events" },
    {
      label: "Obligor Dashboard",
      type: "link" as const,
      href: "/obligor-dashboard",
    },
    {
      label: "Subscription Managers",
      type: "link" as const,
      href: "/subscription-managers",
    },
    {
      label: "Reporting",
      type: "dropdown" as const,
      items: [{ label: "Usage Stats", href: "/usage-stats" }],
    },
    {
      label: "Quick Guide",
      type: "button" as const,
      color: "primary" as const,
    },
  ];

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
      case "/obligor-dashboard":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Obligor Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Obligor dashboard functionality coming soon...
            </Typography>
          </Box>
        );

      case "/monthly-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Monthly Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monthly reporting functionality coming soon...
            </Typography>
          </Box>
        );

      case "/annual-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Annual Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Annual reporting functionality coming soon...
            </Typography>
          </Box>
        );

      case "/subscription-managers":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Subscription Managers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Subscription management functionality coming soon...
            </Typography>
          </Box>
        );

      case "/custom-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Custom Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Custom reporting functionality coming soon...
            </Typography>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to EWI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a page from the navigation to get started.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <AppletProvider applets={APPLETS} theme={appletTheme}>
      <CssBaseline />
      <FeatureFlagProvider
        configs={[
          {
            key: "environment",
            defaultValue: "mock", // Use mock environment to leverage MSW handlers
          },
        ]}
      >
        <DataViewProvider>
          <ThemeProvider theme={appTheme}>
            <AppShell
              logo={
                <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                  EWI
                </span>
              }
              navigation={navigation}
              onNavigate={navigate}
              currentPath={path}
              isDarkMode={isDarkMode}
              onDarkModeToggle={handleDarkModeToggle}
              username="John Doe"
              theme={appTheme}
              right={<ActivityNotifications onNavigate={navigate} />}
            >
              <AppletRouter defaultComponent={AppRoutes} />
            </AppShell>
          </ThemeProvider>
        </DataViewProvider>
      </FeatureFlagProvider>
    </AppletProvider>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
