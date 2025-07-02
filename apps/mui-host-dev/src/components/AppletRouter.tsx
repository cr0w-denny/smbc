import React from "react";
import { Box, Toolbar } from "@mui/material";
import { useHashNavigation, type HostAppletDefinition } from "@smbc/applet-core";
import { getAllRoutes } from "@smbc/applet-core";
import { Dashboard } from "./Dashboard";

interface AppletRouterProps {
  applets: HostAppletDefinition[];
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
  
  // Memoize allRoutes to prevent recreating the array on every render
  const allRoutes = React.useMemo(() => getAllRoutes(applets), [applets]);

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
      }}
    >
      <Toolbar />
      {/* Simple routing - render dashboard or find matching applet */}
      {currentPath === "/" ? (
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
      )}
    </Box>
  );
}