import React, { useEffect } from "react";
import { ThemeProvider, CssBaseline, Box, Toolbar } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from "@tanstack/react-query";

import {
  registerMswHandlers,
  SMBCQueryProvider,
} from "@smbc/shared-query-client";
import {
  ApiDocsModal,
  DevHostAppBar,
  lightTheme,
  darkTheme,
} from "@smbc/mui-components";
import {
  AppProvider,
  FeatureFlagProvider,
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
} from "@smbc/applet-core";

// Import applet system components
import { AppletDrawer, AppletRoutes } from "./components/AppletSystem";

// Import configuration
import {
  APP_CONSTANTS,
  APPLETS,
  demoUser,
  getCurrentApplet,
  roleConfig,
} from "./app.config";

// Feature flag configuration
const featureFlags = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "mockData",
    defaultValue: true,
    description: "Use mock data instead of real API endpoints",
    persist: true,
  },
];

// Register MSW handlers from applets
async function initializeMswHandlers(): Promise<void> {
  // Skip MSW initialization if disabled via environment variable
  if (import.meta.env.VITE_DISABLE_MSW === "true") {
    console.log("MSW disabled via VITE_DISABLE_MSW environment variable");
    return;
  }
  try {
    // Import MSW handlers from API client packages (separate mocks exports)
    const [
      { handlers: userManagementHandlers },
      { handlers: productCatalogHandlers },
    ] = await Promise.all([
      import("@smbc/user-management-client/mocks"),
      import("@smbc/product-catalog-client/mocks"),
    ]);

    // Register all handlers
    const allHandlers = [...userManagementHandlers, ...productCatalogHandlers];

    registerMswHandlers(allHandlers);
    console.log(
      `🎯 Registered ${allHandlers.length} MSW handlers from applets`,
    );
  } catch (error) {
    console.warn("Failed to register MSW handlers:", error);
  }
}

// No other initialization needed - direct applet imports
console.log("🔍 Applets loaded:", APPLETS.length);
console.log(
  "📋 Available applets:",
  APPLETS.map((a) => a.label),
);

function AppContentWithQueryAccess() {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <AppContent />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

function Navigation() {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;
  const toggleMockData = useFeatureFlagToggle("mockData");
  const [apiDocsOpen, setApiDocsOpen] = React.useState(false);

  // Get current path to determine which applet is active
  const { currentPath } = useHashNavigation();
  const currentAppletInfo = getCurrentApplet(currentPath);

  // Debug logging
  React.useEffect(() => {
    console.log("📍 Current path:", currentPath);
    console.log("🔍 Current applet info:", currentAppletInfo);
    if (currentAppletInfo?.originalApplet) {
      console.log("📄 Original applet:", currentAppletInfo.originalApplet);
      console.log("🗂️ API Spec:", currentAppletInfo.originalApplet.apiSpec);
    }
  }, [currentPath, currentAppletInfo]);

  // Close API docs when switching between applets
  React.useEffect(() => {
    setApiDocsOpen(false);
  }, [currentPath]);

  const handleApiDocsOpen = () => {
    setApiDocsOpen(true);
  };

  const handleApiDocsClose = () => {
    setApiDocsOpen(false);
  };

  return (
    <>
      <DevHostAppBar
        currentAppletInfo={currentAppletInfo}
        isDarkMode={isDarkMode}
        onDarkModeToggle={toggleDarkMode}
        mockEnabled={mockEnabled}
        onMockToggle={toggleMockData}
        onApiDocsOpen={handleApiDocsOpen}
        drawerWidth={APP_CONSTANTS.drawerWidth}
      />

      <AppletDrawer />

      {/* API Documentation Modal */}
      {currentAppletInfo && currentAppletInfo.originalApplet && (
        <ApiDocsModal
          open={apiDocsOpen}
          onClose={handleApiDocsClose}
          appletName={currentAppletInfo.hostApplet.label}
          apiSpec={currentAppletInfo.originalApplet.apiSpec.spec}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}

function AppContent() {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: `calc(100% - ${APP_CONSTANTS.drawerWidth}px)`,
      }}
    >
      <Toolbar />
      <AppletRoutes />
    </Box>
  );
}

function AppWithMockToggle() {
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;
  const [mswReady, setMswReady] = React.useState(false);

  // Initialize MSW handlers when mocks are enabled
  React.useEffect(() => {
    if (mockEnabled) {
      initializeMswHandlers().then(() => {
        setMswReady(true);
      });
    } else {
      // Reset MSW state when mocks are disabled
      setMswReady(false);
    }
  }, [mockEnabled]);

  const actualMockState = mockEnabled && mswReady;

  // Debug logging
  React.useEffect(() => {
    console.log(
      `🔄 Mock state changed: mockEnabled=${mockEnabled}, mswReady=${mswReady}, actualMockState=${actualMockState}`,
    );
  }, [mockEnabled, mswReady, actualMockState]);

  return (
    <SMBCQueryProvider enableMocks={actualMockState}>
      <AppContentWithCacheInvalidation />
    </SMBCQueryProvider>
  );
}

function AppContentWithCacheInvalidation() {
  const queryClient = useQueryClient();
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;

  // Clear all cached data when switching between mock and real data
  React.useEffect(() => {
    console.log(
      `🗑️ Clearing React Query cache due to mock toggle: ${mockEnabled}`,
    );
    queryClient.clear(); // Completely clear cache, not just invalidate
  }, [mockEnabled, queryClient]);

  return <AppContentWithQueryAccess />;
}

function AppWithThemeProvider() {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Clear any stale localStorage that might interfere with role setup
  useEffect(() => {
    localStorage.removeItem("roleMapping-selectedRoles");
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppProvider initialRoleConfig={roleConfig} initialUser={demoUser}>
        <AppWithMockToggle />
      </AppProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <FeatureFlagProvider
      configs={featureFlags}
      storagePrefix="smbcHost"
      onFlagChange={(key: string, value: unknown) => {
        console.log(`🚩 Feature flag '${key}' changed to:`, value);
        if (key === "mockData") {
          console.log(`🔄 Mock data ${value ? "enabled" : "disabled"}`);
          if (value) {
            console.log(
              "📝 Now using mock data - great for development and testing",
            );
          } else {
            console.log(
              "🌐 Now using real API endpoints - make sure your backend is running",
            );
          }
        }
      }}
    >
      <AppWithThemeProvider />
    </FeatureFlagProvider>
  );
}
