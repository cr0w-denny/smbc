import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  AppletProvider,
  FeatureFlagProvider,
  calculatePermissionsFromRoles,
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
  useAppletCore,
  getServerUrlFromSpec,
  type AppletMount,
} from "@smbc/applet-core";
import { getCurrentApplet, configureApplets } from "@smbc/applet-host";
import { HostAppBar, ApiDocsModal, AppletDrawer } from "@smbc/mui-applet-devtools";
import { AppletRouter } from "./components/AppletRouter";
import { lightTheme, darkTheme } from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import {
  ActivityProvider,
  TransactionProvider,
} from "@smbc/dataview";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";

// Import configuration
import { APPLETS, DEMO_USER, HOST, ROLE_CONFIG } from "./applet.config";
import type { Environment } from "@smbc/applet-core";

import { setupMSW, stopMSW, resetMSW, addHandlers } from "@smbc/openapi-msw";

// Import generated mock handlers
import { allHandlers } from "./generated/mocks";

// Feature flag configuration
const featureFlags = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "environment",
    defaultValue: "mock" as Environment,
    description: "Application environment (mock/development/qa/production)",
    persist: true,
  },
];

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

        // Log error for debugging
        if (failureCount === 0) {
          console.warn("Query failed, retrying:", error);
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

        // Log error for debugging
        if (failureCount === 0) {
          console.warn("Query failed, retrying:", error);
        }

        // Retry once for network errors
        return failureCount < 1;
      },
    },
  },
});

// Register MSW handlers based on available applets
function initializeMswHandlers(applets: AppletMount[]): void {
  // Skip MSW initialization if disabled via environment variable
  if (import.meta.env.VITE_DISABLE_MSW === "true") {
    console.log("MSW disabled via environment variable");
    return;
  }

  try {
    console.log(`🎭 Initializing MSW handlers for ${applets.length} applets`);
    console.log("Registering MSW handlers:", allHandlers.length);

    // Log all handler URLs for debugging
    allHandlers.forEach((handler, index) => {
      // Extract URL pattern from handler
      const handlerInfo = handler.info || {};
      const method = String(handlerInfo.method || "unknown");
      const path = handlerInfo.path || handler.toString();

      // Try to get more details from the handler
      let handlerDetails = "";
      try {
        // MSW handlers have a .info property with more details
        if (handler.info) {
          handlerDetails = ` | Pattern: ${handler.info.path || "unknown"}`;
        }
      } catch (e) {
        // Ignore errors extracting details
      }

      console.log(
        `🔍 Handler ${index + 1}: ${method.toUpperCase()} ${path}${handlerDetails}`,
      );
    });

    addHandlers(allHandlers);
  } catch (error) {
    console.error("Failed to initialize MSW handlers:", error);
  }
}

function AppContentWithQueryAccess({ applets }: { applets: AppletMount[] }) {
  const handleNavigate = (url: string) => {
    // Simple navigation for the demo - just use hash navigation
    window.location.hash = url;
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Navigation applets={applets} />
        <AppletDrawer
          applets={applets}
          constants={HOST}
          permissionMapping={{ "admin-users": "user-management" }}
          title={HOST.appName}
        />
        <AppletRouter
          applets={applets}
          roleConfig={ROLE_CONFIG}
          constants={HOST}
        />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <ActivitySnackbar onNavigate={handleNavigate} />
    </>
  );
}

function Navigation({ applets }: { applets: AppletMount[] }) {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const [apiDocsOpen, setApiDocsOpen] = React.useState(false);

  // Get current path to determine which applet is active
  const { currentPath } = useHashNavigation();
  const currentAppletInfo = getCurrentApplet(currentPath, applets);

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
      <HostAppBar
        currentAppletInfo={currentAppletInfo}
        isDarkMode={isDarkMode}
        onDarkModeToggle={toggleDarkMode}
        onApiDocsOpen={handleApiDocsOpen}
        drawerWidth={HOST.drawerWidth}
        showMockControls={true}
        showAppletInstallation={true}
      >
        <ActivityNotifications onNavigate={handleNavigate} />
      </HostAppBar>

      {/* API Documentation Modal - direct usage */}
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

function AppWithEnvironment() {
  const environment = useFeatureFlag<Environment>("environment") || "mock";
  const isMockEnvironment = environment === "mock";
  const [mswReady, setMswReady] = React.useState(!isMockEnvironment); // Ready immediately if not using mocks
  const { actions } = useAppletCore();
  const queryClient = useQueryClient();

  // Watch for environment changes and invalidate queries
  const prevEnvironmentRef = React.useRef(environment);
  React.useEffect(() => {
    if (prevEnvironmentRef.current !== environment) {
      console.log("🔄 Environment changed in App, clearing cache immediately:", {
        from: prevEnvironmentRef.current,
        to: environment,
      });
      
      // Clear cache immediately to remove stale data
      console.log("🔄 Clearing query cache immediately...");
      queryClient.removeQueries(); // Clear cache entirely
      console.log("🔄 Query cache cleared");
      
      // Then invalidate after a short delay to allow API client reconfiguration
      setTimeout(() => {
        console.log("🔄 Invalidating queries to trigger fresh fetches...");
        queryClient.invalidateQueries(); // Trigger fresh fetches
        console.log("🔄 Query invalidation complete");
      }, 100);
      
      prevEnvironmentRef.current = environment;
    }
  }, [environment, queryClient]);

  // Use static applets configuration
  const currentApplets = APPLETS;

  // Configure applets with their API URLs, updating based on environment
  React.useEffect(() => {
    configureApplets(currentApplets);
    console.log(`🔄 Configured applets for ${environment} environment`);

    // Log API URLs for each applet for debugging
    currentApplets.forEach((applet) => {
      try {
        const apiUrl = applet.apiSpec
          ? getServerUrlFromSpec(applet.apiSpec, environment)
          : applet.apiBaseUrl || "no API configured";
        console.log(`📍 ${applet.id} API URL: ${apiUrl}`);
      } catch (error) {
        console.error(`❌ Failed to get API URL for ${applet.id}:`, error);
      }
    });
  }, [currentApplets]);

  // Handle MSW worker based on environment
  React.useEffect(() => {
    // Only reset ready state when switching away from mock mode to avoid flash
    if (!isMockEnvironment) {
      setMswReady(true); // Ready immediately for non-mock environments
    }
    // When switching TO mock mode, keep previous ready state until new MSW is ready

    // Update MSW status in app context
    actions.setMswStatus({
      isEnabled: isMockEnvironment,
      isReady: false,
      isInitializing: isMockEnvironment,
    });

    async function setupMsw() {
      if (isMockEnvironment) {
        console.log("🎭 Setting up mock environment...");

        // Reset all mock data stores for fresh start
        resetMSW();

        // Initialize MSW handlers
        initializeMswHandlers(currentApplets);
        console.log("MSW handlers registered, initializing worker...");

        // Start MSW worker
        try {
          await setupMSW(allHandlers, { verbose: true });
          console.log("✅ MSW worker started successfully");
          setMswReady(true);
          actions.setMswStatus({
            isEnabled: true,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate all queries when switching to mocks (with small delay to avoid flicker)
          setTimeout(() => queryClient.invalidateQueries(), 100);
        } catch (error) {
          console.error("❌ Failed to start MSW worker:", error);
          setMswReady(false);
          actions.setMswStatus({
            isEnabled: true,
            isReady: false,
            isInitializing: false,
          });
        }
      } else {
        console.log("🌐 Setting up real API environment...");

        // Stop MSW worker when mocks are disabled
        console.log("Stopping MSW worker...");
        try {
          await stopMSW();
          console.log("✅ MSW worker stopped");
          setMswReady(true); // Ready for real API calls
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate all queries when switching to real API (with small delay to avoid flicker)
          setTimeout(() => queryClient.invalidateQueries(), 100);
        } catch (error) {
          console.error("❌ Failed to stop MSW worker:", error);
          setMswReady(true); // Still allow real API calls even if stop failed
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate queries even if stop failed - switch to real API anyway (with small delay to avoid flicker)
          setTimeout(() => queryClient.invalidateQueries(), 100);
        }
      }
    }

    setupMsw();
  }, [environment]);

  // Only render content when MSW is ready (if using mocks) or when not using mocks
  if (isMockEnvironment && !mswReady) {
    return <AppContentWithQueryAccess applets={[]} />; // Empty applets to prevent data fetching
  }

  return <AppContentWithQueryAccess applets={currentApplets} />;
}

function AppWithThemeProvider() {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Create user with calculated permissions
  const userWithPermissions = {
    ...DEMO_USER,
    permissions: calculatePermissionsFromRoles(DEMO_USER.roles, ROLE_CONFIG),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AppletProvider
          initialRoleConfig={ROLE_CONFIG}
          initialUser={userWithPermissions}
        >
          <AppWithEnvironment />
        </AppletProvider>
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
