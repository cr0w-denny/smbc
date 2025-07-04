import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppProvider,
  FeatureFlagProvider,
  calculatePermissionsFromRoles,
  getCurrentApplet,
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
} from "@smbc/applet-core";
import { AppletDrawer } from "./components/AppletDrawer";
import { AppletRouter } from "./components/AppletRouter";
import {
  ApiDocsModal,
  DevHostAppBar,
  lightTheme,
  darkTheme,
} from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import { registerMswHandlers } from "@smbc/applet-devtools";
import {
  ActivityProvider,
  TransactionProvider,
} from "@smbc/react-query-dataview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    console.log("MSW disabled via environment variable");
    return;
  }
  try {
    // Import MSW handlers from applet-devtools
    const { userManagementHandlers, productCatalogHandlers } = await import(
      "@smbc/applet-devtools"
    );

    // Register all handlers
    const allHandlers = [...userManagementHandlers, ...productCatalogHandlers];
    console.log("Registering MSW handlers:", allHandlers.length);

    registerMswHandlers(allHandlers);
  } catch (error) {
    console.error("Failed to initialize MSW handlers:", error);
  }
}

function AppContentWithQueryAccess() {
  const handleNavigate = (url: string) => {
    // Simple navigation for the demo - just use hash navigation
    window.location.hash = url;
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <AppletDrawer
          applets={APPLETS}
          constants={APP_CONSTANTS}
          permissionMapping={{ "admin-users": "user-management" }}
          title={APP_CONSTANTS.appName}
        />
        <AppletRouter
          applets={APPLETS}
          roleConfig={roleConfig}
          constants={APP_CONSTANTS}
        />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
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
        drawerWidth={APP_CONSTANTS.drawerWidth}
      >
        <ActivityNotifications onNavigate={handleNavigate} />
      </DevHostAppBar>

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
  const [, setMswReady] = React.useState(false);

  // Initialize MSW handlers when mocks are enabled
  React.useEffect(() => {
    async function setupMsw() {
      if (mockEnabled) {
        console.log("Setting up MSW handlers...");
        await initializeMswHandlers();
        console.log("MSW handlers registered, initializing worker...");

        // Start MSW worker
        try {
          const { setupMswForAppletProvider } = await import(
            "@smbc/applet-devtools"
          );
          await setupMswForAppletProvider();
          console.log("MSW worker started successfully");
          setMswReady(true);
        } catch (error) {
          console.error("Failed to start MSW worker:", error);
          setMswReady(false);
        }
      } else {
        // Stop MSW worker when mocks are disabled
        console.log("Stopping MSW worker...");
        try {
          const { stopMswForAppletProvider } = await import(
            "@smbc/applet-devtools"
          );
          await stopMswForAppletProvider();
          console.log("MSW worker stopped");
        } catch (error) {
          console.error("Failed to stop MSW worker:", error);
        }
        setMswReady(false);
      }
    }

    setupMsw();
  }, [mockEnabled]);

  return <AppContentWithCacheInvalidation />;
}

function AppContentWithCacheInvalidation() {
  const queryClient = useQueryClient();
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;

  // Clear all cached data when switching between mock and real data
  React.useEffect(() => {
    queryClient.clear(); // Completely clear cache, not just invalidate
  }, [mockEnabled, queryClient]);

  return <AppContentWithQueryAccess />;
}

// Create QueryClient with good defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
    },
  },
});

function AppWithThemeProvider() {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Create user with calculated permissions
  const userWithPermissions = {
    ...demoUser,
    permissions: calculatePermissionsFromRoles(demoUser.roles, roleConfig),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AppProvider
          initialRoleConfig={roleConfig}
          initialUser={userWithPermissions}
        >
          <AppWithMockToggle />
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <FeatureFlagProvider configs={featureFlags} storagePrefix="smbcHost">
      <ActivityProvider>
        <TransactionProvider>
          <AppWithThemeProvider />
        </TransactionProvider>
      </ActivityProvider>
    </FeatureFlagProvider>
  );
}
