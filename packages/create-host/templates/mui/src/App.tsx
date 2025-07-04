import React from "react";
import { ThemeProvider, CssBaseline, Box, Toolbar, AppBar, IconButton, Typography } from "@mui/material";
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
  createAppletSections,
} from "@smbc/applet-core";
import {
  getTheme,
  AppletDrawer,
} from "@smbc/mui-components";
import { ActivitySnackbar, ActivityNotifications } from "@smbc/mui-applet-core";
import {
  ActivityProvider,
  TransactionProvider,
} from "@smbc/react-query-dataview";

import { 
  demoUser, 
  APPLETS, 
  roleConfig,
  APP_CONSTANTS 
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
    import('@smbc/mui-applet-devtools')
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
    return <div>Loading...</div>;
  }

  if (DevDashboard) {
    return (
      <DevDashboard 
        appName={APP_CONSTANTS.appName}
        applets={APPLETS}
      />
    );
  }

  // Fallback to simple welcome page if mui-applet-devtools not installed
  return (
    <div>
      <h1>Welcome to {APP_CONSTANTS.appName}</h1>
      <p>Your SMBC applet host application is ready!</p>
      {Object.keys(APPLETS).length === 0 ? (
        <p>Add applets to your configuration in <code>src/app.config.ts</code></p>
      ) : (
        <p>Available applets: {Object.values(APPLETS).map(a => a.label).join(", ")}</p>
      )}
    </div>
  );
}


function AppContent() {
  const isDarkMode = useFeatureFlag("darkMode");
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const theme = getTheme(isDarkMode ? "dark" : "light");
  const userPermissions = calculatePermissionsFromRoles(demoUser.roles, roleConfig);
  
  // Create user with calculated permissions
  const userWithPermissions = {
    ...demoUser,
    permissions: userPermissions,
  };

  const { currentPath, navigateTo } = useHashNavigation();
  const allRoutes = React.useMemo(() => getAllRoutes(Object.values(APPLETS)), []);

  return (
    <ActivityProvider>
      <TransactionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppProvider
            initialUser={userWithPermissions}
            initialRoleConfig={roleConfig}
          >
              <Box sx={{ display: "flex", minHeight: "100vh" }}>
                {/* App Bar */}
                <AppBar
                  position="fixed"
                  sx={{
                    width: `calc(100% - 240px)`,
                    ml: `240px`,
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
                  width={240}
                  currentPath={currentPath}
                  onNavigate={navigateTo}
                  rootRoute={{ 
                    path: "/", 
                    label: "Home",
                    icon: undefined 
                  }}
                  appletSections={createAppletSections(APPLETS)}
                />
                
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    width: `calc(100% - 240px)`,
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
                          (currentPath !== "/" && route.path !== "/" && currentPath.startsWith(route.path))
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