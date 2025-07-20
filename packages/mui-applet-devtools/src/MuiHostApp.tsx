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
  type RoleConfig,
  type User,
  type Environment,
} from "@smbc/applet-core";
import { getCurrentApplet, configureApplets } from "@smbc/applet-host";
import {
  HostAppBar,
  ApiDocsModal,
  AppletDrawer,
  MuiAppletRouter,
} from "./index";
import { lightTheme, darkTheme } from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import { ActivityProvider, TransactionProvider } from "@smbc/dataview";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { setupMSW, stopMSW, resetMSW, addHandlers } from "@smbc/openapi-msw";

export interface MuiHostAppProps {
  applets: AppletMount[];
  roleConfig: RoleConfig;
  demoUser: User;
  appName: string;
  drawerWidth?: number;
  // MSW configuration
  mswHandlers?: any[];
  enableMocksByDefault?: boolean;
  disableMSW?: boolean; // Allow disabling MSW via prop instead of env var
  // Optional permission mapping for applet IDs
  permissionMapping?: Record<string, string>;
  // Optional feature flags configuration
  featureFlags?: Array<{
    key: string;
    defaultValue: any;
    description: string;
    persist?: boolean;
  }>;
  // Optional storage prefix for feature flags
  storagePrefix?: string;
  // Override default QueryClient
  queryClient?: QueryClient;
}

// Default feature flags that most host apps need
const DEFAULT_FEATURE_FLAGS = [
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

// Create default QueryClient with good defaults
const createDefaultQueryClient = () =>
  new QueryClient({
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

// Internal component that has access to feature flags
function AppWithEnvironment({
  applets,
  roleConfig,
  appName,
  drawerWidth = 240,
  permissionMapping,
  mswHandlers = [],
  enableMocksByDefault = true,
  disableMSW = false,
}: MuiHostAppProps) {
  const environment = useFeatureFlag<Environment>("environment") || "mock";
  const isMockEnvironment = environment === "mock";
  const [mswReady, setMswReady] = React.useState(!isMockEnvironment);
  const { actions } = useAppletCore();
  const queryClient = useQueryClient();

  // Watch for environment changes and invalidate queries
  const prevEnvironmentRef = React.useRef(environment);
  React.useEffect(() => {
    if (prevEnvironmentRef.current !== environment) {
      console.log("🔄 Environment changed, clearing cache:", {
        from: prevEnvironmentRef.current,
        to: environment,
      });

      queryClient.removeQueries();
      setTimeout(() => {
        queryClient.invalidateQueries();
      }, 100);

      prevEnvironmentRef.current = environment;
    }
  }, [environment, queryClient]);

  // Configure applets with their API URLs
  React.useEffect(() => {
    configureApplets(applets);
    console.log(`🔄 Configured applets for ${environment} environment`);

    applets.forEach((applet) => {
      try {
        const apiUrl = applet.apiSpec
          ? getServerUrlFromSpec(applet.apiSpec, environment)
          : applet.apiBaseUrl || "no API configured";
        console.log(`📍 ${applet.id} API URL: ${apiUrl}`);
      } catch (error) {
        console.error(`❌ Failed to get API URL for ${applet.id}:`, error);
      }
    });
  }, [environment]);

  // Handle MSW worker based on environment
  React.useEffect(() => {
    if (!isMockEnvironment) {
      setMswReady(true);
    }

    actions.setMswStatus({
      isEnabled: isMockEnvironment,
      isReady: false,
      isInitializing: isMockEnvironment,
    });

    async function setupMsw() {
      if (
        isMockEnvironment &&
        enableMocksByDefault &&
        mswHandlers.length > 0 &&
        !disableMSW
      ) {
        console.log("🎭 Setting up mock environment...");
        resetMSW();

        try {
          console.log(
            `🎭 Initializing MSW handlers for ${applets.length} applets`,
          );
          console.log("Registering MSW handlers:", mswHandlers.length);
          addHandlers(mswHandlers);
        } catch (error) {
          console.error("Failed to initialize MSW handlers:", error);
        }

        try {
          await setupMSW(mswHandlers, { verbose: true });
          console.log("✅ MSW worker started successfully");
          setMswReady(true);
          actions.setMswStatus({
            isEnabled: true,
            isReady: true,
            isInitializing: false,
          });
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

        try {
          await stopMSW();
          console.log("✅ MSW worker stopped");
          setMswReady(true);
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          setTimeout(() => queryClient.invalidateQueries(), 100);
        } catch (error) {
          console.error("❌ Failed to stop MSW worker:", error);
          setMswReady(true);
          actions.setMswStatus({
            isEnabled: false,
            isReady: true,
            isInitializing: false,
          });
          setTimeout(() => queryClient.invalidateQueries(), 100);
        }
      }
    }

    setupMsw();
  }, [environment, isMockEnvironment]); // Remove all potentially unstable dependencies

  // Only render content when MSW is ready
  if (isMockEnvironment && !mswReady) {
    return (
      <AppContentWithQueryAccess
        applets={[]}
        roleConfig={roleConfig}
        appName={appName}
        drawerWidth={drawerWidth}
        permissionMapping={permissionMapping}
      />
    );
  }

  return (
    <AppContentWithQueryAccess
      applets={applets}
      roleConfig={roleConfig}
      appName={appName}
      drawerWidth={drawerWidth}
      permissionMapping={permissionMapping}
    />
  );
}

// Main app content with navigation
function AppContentWithQueryAccess({
  applets,
  roleConfig,
  appName,
  drawerWidth = 240,
  permissionMapping = {},
}: Pick<
  MuiHostAppProps,
  "applets" | "roleConfig" | "appName" | "drawerWidth" | "permissionMapping"
>) {
  const handleNavigate = (url: string) => {
    window.location.hash = url;
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Navigation
          applets={applets}
          appName={appName}
          drawerWidth={drawerWidth}
        />
        <AppletDrawer
          applets={applets}
          constants={{ appName, drawerWidth }}
          permissionMapping={permissionMapping}
          title={appName}
        />
        <MuiAppletRouter
          applets={applets}
          roleConfig={roleConfig}
          drawerWidth={drawerWidth}
        />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <ActivitySnackbar onNavigate={handleNavigate} />
    </>
  );
}

// Navigation component with app bar
function Navigation({
  applets,
  drawerWidth,
}: {
  applets: AppletMount[];
  appName: string;
  drawerWidth: number;
}) {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const [apiDocsOpen, setApiDocsOpen] = React.useState(false);

  const { currentPath } = useHashNavigation();
  const currentAppletInfo = getCurrentApplet(currentPath, applets);

  React.useEffect(() => {
    setApiDocsOpen(false);
  }, [currentPath]);

  const handleApiDocsOpen = () => setApiDocsOpen(true);
  const handleApiDocsClose = () => setApiDocsOpen(false);
  const handleNavigate = (url: string) => (window.location.hash = url);

  return (
    <>
      <HostAppBar
        currentAppletInfo={currentAppletInfo}
        isDarkMode={isDarkMode}
        onDarkModeToggle={toggleDarkMode}
        onApiDocsOpen={handleApiDocsOpen}
        drawerWidth={drawerWidth}
        showMockControls={true}
        showAppletInstallation={true}
      >
        <ActivityNotifications onNavigate={handleNavigate} />
      </HostAppBar>

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

// Component with theme provider
function AppWithThemeProvider(props: MuiHostAppProps) {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Create user with calculated permissions
  const userWithPermissions = {
    ...props.demoUser,
    permissions: calculatePermissionsFromRoles(
      props.demoUser.roles,
      props.roleConfig,
    ),
  };

  return (
    <QueryClientProvider
      client={props.queryClient || createDefaultQueryClient()}
    >
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AppletProvider
          initialRoleConfig={props.roleConfig}
          initialUser={userWithPermissions}
        >
          <AppWithEnvironment {...props} />
        </AppletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * A complete Material-UI host application component with all necessary providers and setup.
 *
 * Features:
 * - Theme management with dark mode support
 * - Environment switching (mock/dev/qa/prod)
 * - MSW mock service worker integration
 * - Query client with sensible defaults
 * - Feature flags support
 * - Activity tracking
 * - Transaction support for data operations
 * - Navigation with drawer and app bar
 *
 * @example
 * ```tsx
 * import { MuiHostApp } from '@smbc/mui-applet-devtools';
 * import { APPLETS, ROLE_CONFIG, DEMO_USER, allHandlers } from './config';
 *
 * export function App() {
 *   return (
 *     <MuiHostApp
 *       appName="My App"
 *       applets={APPLETS}
 *       roleConfig={ROLE_CONFIG}
 *       demoUser={DEMO_USER}
 *       drawerWidth={240}
 *       mswHandlers={allHandlers}
 *     />
 *   );
 * }
 * ```
 */
export function MuiHostApp(props: MuiHostAppProps) {
  const mergedFeatureFlags = [
    ...DEFAULT_FEATURE_FLAGS,
    ...(props.featureFlags || []),
  ];

  return (
    <FeatureFlagProvider
      configs={mergedFeatureFlags}
      storagePrefix={props.storagePrefix || "smbcHost"}
    >
      <ActivityProvider>
        <TransactionProvider>
          <AppWithThemeProvider {...props} />
        </TransactionProvider>
      </ActivityProvider>
    </FeatureFlagProvider>
  );
}
