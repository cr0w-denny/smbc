import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import { AuthGate } from "./components/AuthGate";
import { ErrorBoundary } from "./components/ErrorBoundary";

import {
  AppletProvider,
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagToggle,
  useHashNavigation,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS, ROLE_CONFIG } from "./applet.config";
import { createCssVarTheme } from "@smbc/mui-components";
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
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");

  // Set data-theme attribute on document for CSS variable switching
  React.useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  const handleDarkModeToggle = (enabled: boolean) => {
    toggleDarkMode();
  };

  // Create theme based on current mode
  const theme = React.useMemo(() => createCssVarTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
      case "/approvals":
        return (
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
            <Typography variant="h4" gutterBottom>
              Event Workflow Approvals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Event eorkflow approval functionality coming soon...
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
        <ThemeProvider theme={theme}>
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
          onProfile={() => console.log("Profile clicked")}
          onSettings={() => console.log("Settings clicked")}
          onQuickGuide={() => console.log("Quick Guide clicked")}
          onLogout={() => {
            console.log("Logout clicked");
            alert("Logout functionality would be implemented here");
          }}
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
          {
            key: "darkMode",
            defaultValue: false,
            persist: true,
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
