import React from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
} from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AppProvider,
  FeatureFlagProvider,
  calculatePermissionsFromRoles,
  useFeatureFlag,
  useFeatureFlagToggle,
  useHashNavigation,
  getAllRoutes,
  useHostNavigation,
  useApp,
  useUser,
} from "@smbc/applet-core";
import { getTheme, AppletDrawer } from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import {
  ActivityProvider,
  TransactionProvider,
} from "@smbc/react-query-dataview";

import { demoUser, APPLETS, roleConfig, APP_CONSTANTS } from "./app.config";

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
    defaultValue: false,
    description: "Enable mock data for development",
    persist: true,
  },
];

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Home content component with conditional dev dashboard
function HomeContent() {
  const [DevDashboard, setDevDashboard] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Try to dynamically import DevDashboard from mui-applet-devtools
    import("@smbc/mui-applet-devtools")
      .then((module) => {
        setDevDashboard(() => module.DevDashboard);
        setLoading(false);
      })
      .catch(() => {
        // mui-applet-devtools not available, use fallback
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Typography>Loading development dashboard...</Typography>
      </Box>
    );
  }

  if (DevDashboard) {
    return <DevDashboard appName={APP_CONSTANTS.appName} applets={APPLETS} />;
  }

  // Fallback to simple welcome page if mui-applet-devtools not installed
  return (
    <div>
      <h1>Welcome to {APP_CONSTANTS.appName}</h1>
      <p>Your SMBC applet host application is ready!</p>
      {Object.keys(APPLETS).length === 0 ? (
        <p>
          Add applets to your configuration in <code>src/app.config.ts</code>
        </p>
      ) : (
        <p>
          Available applets:{" "}
          {Object.values(APPLETS)
            .map((a) => a.label)
            .join(", ")}
        </p>
      )}
    </div>
  );
}

// Component that uses navigation hooks - must be inside AppProvider
function AppLayout() {
  const { currentPath, navigateTo } = useHashNavigation();
  const { roleUtils } = useApp();
  const { user } = useUser();
  const isDarkMode = useFeatureFlag("darkMode");
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const allRoutes = React.useMemo(
    () => getAllRoutes(Object.values(APPLETS)),
    [],
  );

  console.log("User in AppLayout:", user);
  console.log("User roles:", user?.roles);

  // Create permission checker that uses current user's roles
  const hasAnyPermission = React.useCallback(
    (appletId: string, permissions: string[]) => {
      const result = roleUtils.hasAnyPermission(
        user?.roles || [],
        appletId,
        permissions,
      );
      console.log(
        `Permission check: appletId=${appletId}, permissions=${permissions}, userRoles=${user?.roles}, result=${result}`,
      );
      return result;
    },
    [roleUtils, user?.roles],
  );

  // Use host navigation with internal routes
  const { rootRoute, menuSections } = useHostNavigation({
    applets: Object.values(APPLETS),
    hasAnyPermission,
    includeInternalRoutes: true,
  });

  console.log("Applets:", Object.values(APPLETS));
  console.log("Root route:", rootRoute);
  console.log("Menu sections:", menuSections);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${APP_CONSTANTS.drawerWidth}px)`,
          ml: `${APP_CONSTANTS.drawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {APP_CONSTANTS.appName}
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            aria-label="toggle dark mode"
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <ActivityNotifications />
        </Toolbar>
      </AppBar>

      <AppletDrawer
        width={APP_CONSTANTS.drawerWidth}
        currentPath={currentPath}
        menuSections={menuSections}
        onNavigate={navigateTo}
        rootRoute={
          rootRoute || {
            path: "/",
            label: "Home",
            icon: undefined,
          }
        }
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${APP_CONSTANTS.drawerWidth}px)`,
        }}
      >
        <Toolbar />
        {/* Simple routing - render home or find matching applet */}
        {currentPath === "/" ? (
          <HomeContent />
        ) : (
          (() => {
            // Find the current route
            const currentRoute = allRoutes.find(
              (route) =>
                route.path === currentPath ||
                (currentPath !== "/" &&
                  route.path !== "/" &&
                  currentPath.startsWith(route.path)),
            );

            if (currentRoute) {
              const RouteComponent = currentRoute.component;
              return <RouteComponent />;
            }

            // Fallback to home
            return <div>Route not found</div>;
          })()
        )}
      </Box>
    </Box>
  );
}

function AppContent() {
  const isDarkMode = useFeatureFlag("darkMode");
  const theme = getTheme(isDarkMode ? "dark" : "light");
  const userPermissions = calculatePermissionsFromRoles(
    demoUser.roles,
    roleConfig,
  );

  // Create user with calculated permissions
  const userWithPermissions = {
    ...demoUser,
    permissions: userPermissions,
  };

  console.log("AppContent - userWithPermissions:", userWithPermissions);
  console.log("AppContent - roleConfig:", roleConfig);

  return (
    <ActivityProvider>
      <TransactionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppProvider
            initialUser={userWithPermissions}
            initialRoleConfig={roleConfig}
          >
            <AppLayout />
            <ActivitySnackbar />
          </AppProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </TransactionProvider>
    </ActivityProvider>
  );
}

export default function App() {
  return (
    <FeatureFlagProvider configs={featureFlags}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </FeatureFlagProvider>
  );
}
