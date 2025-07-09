import React from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import {
  AppProvider,
  calculatePermissionsFromRoles,
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagToggle,
  useHashNavigation,
  getCurrentApplet,
} from "@smbc/applet-core";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { DataViewProvider } from "@smbc/react-query-dataview";
import { HostAppBar, ActivityNotifications } from "@smbc/mui-applet-core";
import { lightTheme, darkTheme } from "@smbc/mui-components";

import {
  demoUser,
  roleConfig,
  featureFlags,
  queryClient,
  HOST,
  APPLETS,
  DEV_FEATURES,
} from "./config.app";
import { NavigationDrawer } from "./components/NavigationDrawer";
import { AppletRouter } from "./components/AppletRouter";

function AppContent() {
  const { currentPath } = useHashNavigation();
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const currentAppletInfo = getCurrentApplet(currentPath, APPLETS);
  const [apiDocsOpen, setApiDocsOpen] = React.useState(false);

  // Close API docs when switching between applets
  React.useEffect(() => {
    setApiDocsOpen(false);
  }, [currentPath]);

  const handleApiDocsOpen = DEV_FEATURES.apiDocs
    ? () => {
        setApiDocsOpen(true);
      }
    : undefined;

  const handleNavigate = (url: string) => {
    window.location.hash = url;
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <HostAppBar
          currentAppletInfo={currentAppletInfo}
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
          onApiDocsOpen={handleApiDocsOpen}
          drawerWidth={HOST.drawerWidth}
          showMockControls={DEV_FEATURES.mockControls}
          showAppletClickToCopy={DEV_FEATURES.appletClickToCopy}
        >
          <ActivityNotifications onNavigate={handleNavigate} />
        </HostAppBar>
        <NavigationDrawer />
        <AppletRouter />

        {/* API Documentation Modal - disabled in production */}
      </Box>
    </ThemeProvider>
  );
}

function AppWithMockData() {
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;
  const [mswReady, setMswReady] = React.useState(false);
  const queryClient = useQueryClient();

  // MSW setup for development
  React.useEffect(() => {
    async function setupMSW() {
      if (!DEV_FEATURES.mockControls || !mockEnabled) {
        setMswReady(true);
        return;
      }

      try {
        // Dynamic import to exclude from production bundle
        const {
          registerMswHandlers,
          setupMswForAppletProvider,
          userManagementHandlers,
        } = await import("@smbc/mui-applet-devtools");

        // Register handlers from applets
        const allHandlers = [...userManagementHandlers];
        registerMswHandlers(allHandlers);

        // Start MSW worker
        await setupMswForAppletProvider();

        console.log("MSW started successfully");
        setMswReady(true);
      } catch (error) {
        console.error("Failed to start MSW:", error);
        setMswReady(true);
      }
    }

    setupMSW();

    return () => {
      // Cleanup will be handled by the applet devtools
    };
  }, [mockEnabled]);

  // Clear cache when switching between mock and real data
  React.useEffect(() => {
    queryClient.clear();
  }, [mockEnabled, queryClient]);

  // Wait for MSW to be ready before rendering
  if (!mswReady) {
    return null;
  }

  return <AppContent />;
}

export function App() {
  const userWithPermissions = {
    ...demoUser,
    permissions: calculatePermissionsFromRoles(demoUser.roles, roleConfig),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataViewProvider>
        <FeatureFlagProvider configs={featureFlags} storagePrefix="smbcHost">
          <AppProvider
            initialRoleConfig={roleConfig}
            initialUser={userWithPermissions}
          >
            <AppWithMockData />
          </AppProvider>
        </FeatureFlagProvider>
      </DataViewProvider>
    </QueryClientProvider>
  );
}
