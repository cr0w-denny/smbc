import React, { useEffect } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppProvider,
  FeatureFlagProvider,
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
} from "@smbc/applet-core";
import { AppletHost } from "@smbc/mui-applet-host";
import { getCurrentApplet } from "@smbc/applet-core";
import {
  ApiDocsModal,
  DevHostAppBar,
  ActivitySnackbar,
  lightTheme,
  darkTheme,
} from "@smbc/mui-components";
import {
  registerMswHandlers,
  SMBCQueryProvider,
} from "@smbc/shared-query-client";
import { ActivityProvider } from "@smbc/react-dataview";

// Import configuration
import { APP_CONSTANTS, APPLETS, demoUser, roleConfig } from "./app.config";

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
  const handleNavigate = (url: string) => {
    // Simple navigation for the demo - just use hash navigation
    window.location.hash = url;
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <AppletHost
          applets={APPLETS}
          constants={APP_CONSTANTS}
          roleConfig={roleConfig}
          permissionMapping={{ "admin-users": "user-management" }}
          title={APP_CONSTANTS.appName}
        />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} />
      <ActivitySnackbar onNavigate={handleNavigate} />
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
  const currentAppletInfo = getCurrentApplet(currentPath, APPLETS);

  // Debug logging
  React.useEffect(() => {
    console.log("📍 Current path:", currentPath);
    console.log("🔍 Current applet info:", currentAppletInfo);
    if (currentAppletInfo?.apiSpec) {
      console.log("🗂️ API Spec:", currentAppletInfo.apiSpec);
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

  const handleNavigate = (url: string) => {
    // Simple navigation for the demo - just use hash navigation
    window.location.hash = url;
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
        onNavigate={handleNavigate}
        drawerWidth={APP_CONSTANTS.drawerWidth}
      />

      {/* API Documentation Modal */}
      {currentAppletInfo && currentAppletInfo.apiSpec && (
        <ApiDocsModal
          open={apiDocsOpen}
          onClose={handleApiDocsClose}
          appletName={currentAppletInfo.label}
          apiSpec={currentAppletInfo.apiSpec.spec}
          isDarkMode={isDarkMode}
        />
      )}
    </>
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
      <ActivityProvider>
        <AppWithThemeProvider />
      </ActivityProvider>
    </FeatureFlagProvider>
  );
}
