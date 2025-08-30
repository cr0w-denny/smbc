import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import {
  useHashNavigation,
  AppletProvider,
  FeatureFlagProvider,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS } from "./applet.config";
import { createTheme } from "@smbc/mui-components";
import { navigation } from "./menu";

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

  // App theme - always dark mode for shell/navigation
  const appTheme = createTheme(true);

  // Applet theme - responds to dark mode toggle for content areas
  const appletTheme = React.useMemo(
    () => createTheme(isDarkMode),
    [isDarkMode],
  );

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
            defaultValue: "mock",
          },
        ]}
      >
        <DataViewProvider>
          <ThemeProvider theme={appTheme}>
            <AppShell
              logo={
                <img
                  src={`${import.meta.env.BASE_URL}logo.svg`}
                  alt="EWI Logo"
                  style={{ height: 60 }}
                />
              }
              navigation={navigation}
              onNavigate={navigate}
              currentPath={path}
              isDarkMode={isDarkMode}
              onDarkModeToggle={handleDarkModeToggle}
              username="John Doe"
              theme={appTheme}
              right={
                <Box sx={{ "& .MuiIconButton-root svg": { fontSize: 28 } }}>
                  <ActivityNotifications onNavigate={navigate} />
                </Box>
              }
              maxWidth={{
                xs: "96%",
                sm: "96%",
                md: "88%", // 6% margin on each side
                lg: "88%", // 6% margin on each side
                xl: "92%", // 4% margin on each side
              }}
            >
              <Box sx={{ pt: 2 }}>
                <AppletRouter defaultComponent={AppRoutes} />
              </Box>
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
