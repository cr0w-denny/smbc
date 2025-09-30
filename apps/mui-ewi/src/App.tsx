import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import { AuthGate } from "./components/AuthGate";
import { ErrorBoundary } from "./components/ErrorBoundary";

import {
  useHashNavigation,
  AppletProvider,
  FeatureFlagProvider,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS, ROLE_CONFIG } from "./applet.config";
import { createTheme } from "@smbc/mui-components";
import { navigation } from "./menu";

// Simple production query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

configureApplets(APPLETS);

const AppShellContent: React.FC = () => {
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

  const handleProfile = () => {
    console.log("Profile clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleQuickGuide = () => {
    console.log("Quick Guide clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    alert("Logout functionality would be implemented here");
  };

  const appTheme = React.useMemo(() => createTheme(isDarkMode), [isDarkMode]);

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
      case "/subscription-managers":
        return (
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
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
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
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

  const maxWidthConfig = {
    xs: "96%",
    sm: "96%",
    md: "88%",
    lg: "88%",
    xl: "92%",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AppShell.Layout
          logo={
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="EWI Logo"
              style={{ height: 60, cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          }
          navigation={navigation}
          onNavigate={navigate}
          currentPath={path}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          username="John Doe"
          theme={appTheme}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onQuickGuide={handleQuickGuide}
          onLogout={handleLogout}
          right={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                "& .MuiIconButton-root svg": { fontSize: 28 },
              }}
            >
              <ActivityNotifications onNavigate={navigate} />
            </Box>
          }
          maxWidth={maxWidthConfig}
        >
          <ErrorBoundary>
            <AppletRouter defaultComponent={AppRoutes} />
          </ErrorBoundary>
        </AppShell.Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const AppContent: React.FC = () => {
  // Create demo user with Analyst role
  const initialUser = {
    id: "1",
    email: "analyst@example.com",
    name: "Production User",
    roles: ["Analyst"],
  };

  return (
    <AppletProvider
      applets={APPLETS}
      initialRoleConfig={ROLE_CONFIG}
      initialUser={initialUser}
    >
      <FeatureFlagProvider
        configs={[
          {
            key: "environment",
            defaultValue: "production",
          },
        ]}
      >
        <DataViewProvider>
          <AppShellContent />
        </DataViewProvider>
      </FeatureFlagProvider>
    </AppletProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthGate>
      <AppContent />
    </AuthGate>
  );
};

export default App;
