import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  AppProvider,
  FeatureFlagProvider,
  calculatePermissionsFromRoles,
  getCurrentApplet,
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
  configureApplets,
  useApp,
  type AppletMount,
} from "@smbc/applet-core";
import { AppletDrawer } from "./components/AppletDrawer";
import { AppletRouter } from "./components/AppletRouter";
import { HostAppBar } from "@smbc/mui-applet-core";
import { ApiDocsWrapper } from "./components/ApiDocsWrapper";
import { lightTheme, darkTheme } from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import {
  ActivityProvider,
  TransactionProvider,
} from "@smbc/react-query-dataview";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

// Import configuration
import { HOST, createApplets, DEMO_USER, ROLE_CONFIG } from "./app.config";

// Static imports for development - these will be excluded in production templates
import {
  registerMswHandlers,
  setupMswForAppletProvider,
  stopMswForAppletProvider,
  resetAllMocks,
  autoHealMswWorker,
  userManagementHandlers,
  productCatalogHandlers,
} from "@smbc/mui-applet-devtools";

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

// Mapping of applet IDs to their mock handlers
const APPLET_HANDLERS = {
  "user-management": userManagementHandlers,
  "product-catalog": productCatalogHandlers,
  // Add new applets here
};

// Create QueryClient with good defaults and MSW auto-healing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: async (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        
        // Try auto-healing MSW worker on JSON parse errors
        if (failureCount === 0) {
          const wasHealed = await autoHealMswWorker(error);
          if (wasHealed) {
            return true; // Retry after auto-heal
          }
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: async (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        
        // Try auto-healing MSW worker on JSON parse errors
        if (failureCount === 0) {
          const wasHealed = await autoHealMswWorker(error);
          if (wasHealed) {
            return true; // Retry after auto-heal
          }
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
    // Collect handlers for all configured applets
    const allHandlers = [];

    for (const applet of applets) {
      const handlers =
        APPLET_HANDLERS[applet.id as keyof typeof APPLET_HANDLERS];
      if (handlers && Array.isArray(handlers)) {
        allHandlers.push(...handlers);
        console.log(`Loaded ${handlers.length} handlers for ${applet.id}`);
      } else {
        console.warn(`No handlers found for applet: ${applet.id}`);
      }
    }

    console.log("Registering MSW handlers:", allHandlers.length);
    registerMswHandlers(allHandlers);
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

      {/* API Documentation Modal - dynamically loaded */}
      {currentAppletInfo && currentAppletInfo.apiSpec && (
        <ApiDocsWrapper
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
  const [mswReady, setMswReady] = React.useState(!mockEnabled); // Ready immediately if mocks disabled
  const { actions } = useApp();
  const queryClient = useQueryClient();

  // Get current applets based on mock flag
  const currentApplets = React.useMemo(() => {
    const environment = mockEnabled ? 'mock' : 'development';
    return createApplets(environment);
  }, [mockEnabled]);

  // Configure applets with their API URLs, updating based on mock flag
  React.useEffect(() => {
    configureApplets(currentApplets);
    const environment = mockEnabled ? 'mock' : 'development';
    console.log(`🔄 Configured applets for ${environment} environment`);
  }, [currentApplets, mockEnabled]);

  // Handle MSW worker based on mock toggle
  React.useEffect(() => {
    setMswReady(false); // Reset ready state when toggling
    
    // Update MSW status in app context
    actions.setMswStatus({
      isEnabled: mockEnabled,
      isReady: false,
      isInitializing: mockEnabled,
    });

    async function setupMsw() {
      if (mockEnabled) {
        console.log("🎭 Setting up mock environment...");

        // Reset all mock data stores for fresh start
        resetAllMocks();

        // Initialize MSW handlers
        initializeMswHandlers(currentApplets);
        console.log("MSW handlers registered, initializing worker...");

        // Start MSW worker
        try {
          await setupMswForAppletProvider();
          console.log("✅ MSW worker started successfully");
          setMswReady(true);
          actions.setMswStatus({
            isEnabled: true,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate all queries when switching to mocks
          queryClient.invalidateQueries();
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
          await stopMswForAppletProvider();
          console.log("✅ MSW worker stopped");
          setMswReady(true); // Ready for real API calls
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate all queries when switching to real API
          queryClient.invalidateQueries();
        } catch (error) {
          console.error("❌ Failed to stop MSW worker:", error);
          setMswReady(true); // Still allow real API calls even if stop failed
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          // Invalidate queries even if stop failed - switch to real API anyway
          queryClient.invalidateQueries();
        }
      }
    }

    setupMsw();
  }, [mockEnabled]);

  // Only render content when MSW is ready (if mocks enabled) or when mocks disabled
  if (mockEnabled && !mswReady) {
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
        <AppProvider
          initialRoleConfig={ROLE_CONFIG}
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
