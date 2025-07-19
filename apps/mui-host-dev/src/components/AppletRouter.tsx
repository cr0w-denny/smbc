import React from "react";
import { Box, Toolbar } from "@mui/material";
import { useHashNavigation, type AppletMount } from "@smbc/applet-core";
import { getAllRoutes } from "@smbc/applet-host";
import { Dashboard } from "./Dashboard";

interface AppletRouterProps {
  applets: AppletMount[];
  roleConfig: any;
  constants: {
    drawerWidth: number;
  };
}

export function AppletRouter({
  applets,
  roleConfig,
  constants,
}: AppletRouterProps) {
  const { currentPath } = useHashNavigation();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  
  // Memoize allRoutes to prevent recreating the array on every render
  const allRoutes = React.useMemo(() => getAllRoutes(applets), [applets]);

  // Clear initial load flag when we have applets and a valid route
  React.useEffect(() => {
    if (applets.length > 0) {
      // Use a small delay to ensure the component has time to render the loading state
      const timer = setTimeout(() => setIsInitialLoad(false), 50);
      return () => clearTimeout(timer);
    }
  }, [applets]);

  const DashboardComponent = React.useMemo(
    () => () => <Dashboard hostApplets={applets} roleConfig={roleConfig} />,
    [applets, roleConfig],
  );

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: `calc(100% - ${constants.drawerWidth}px)`,
        marginLeft: `${constants.drawerWidth}px`,
      }}
    >
      <Toolbar />
      {/* Show subtle loading state on initial load if not on root path */}
      {isInitialLoad && currentPath !== "/" ? (
        <Box
          sx={{
            minHeight: '50vh',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
          }}
        />
      ) : (
        /* Simple routing - render dashboard or find matching applet */
        currentPath === "/" ? (
          <DashboardComponent />
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
            
            // Fallback to dashboard
            return <DashboardComponent />;
          })()
        )
      )}
    </Box>
  );
}