import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useInternalNavigation } from "@smbc/applet-core";
import { navigationGroups, internalRoutes } from "./navigation";
import { NavigationRoute } from "./components/NavigationRoute";
import { FilteringRoute } from "./components/FilteringRoute";
import { PermissionsRoute } from "./components/PermissionsRoute";
import { DataViewRoute } from "./components/DataViewRoute";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

// Add display properties for internal rendering
const routes = internalRoutes.map((route) => ({
  ...route,
  emoji: route.icon, // Use icon as emoji for display
  title: `${route.label} - ${route.icon}`,
}));

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  const {
    currentPath,
    navigateTo,
    allowedRoutes,
    currentRoute,
    canAccess,
    hasAnyAccess,
    hostNavigationGroups,
  } = useInternalNavigation({
    appletId: "hello",
    mountPath,
    routes,
    navigationGroups,
  });

  // Demo: Log navigation groups for host consumption
  console.log("Host Navigation Groups:", hostNavigationGroups);

  const renderContent = () => {
    // Filter Demo for route-two
    if (currentPath === "/route-two" && canAccess(currentPath)) {
      return <FilteringRoute />;
    }

    // Hash Navigation Overview for route-one
    if (currentPath === "/route-one" && canAccess(currentPath)) {
      return <NavigationRoute />;
    }

    // Permission and Role Mappings Overview for route-three
    if (currentPath === "/route-three" && canAccess(currentPath)) {
      return <PermissionsRoute currentRoute={currentRoute} />;
    }

    // DataView Component Overview for route-four
    if (currentPath === "/route-four" && canAccess(currentPath)) {
      return <DataViewRoute />;
    }

    // Check if we have a current route and can access it (for other routes)
    if (currentRoute && canAccess(currentPath)) {
      return (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h1" sx={{ fontSize: "10rem" }}>
            {currentRoute.emoji}
          </Typography>
          <Typography variant="h4">{currentRoute.title}</Typography>
        </Box>
      );
    }

    // Access denied for current route
    if (currentRoute && !canAccess(currentPath)) {
      return (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h4" color="error">
            🚫 Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to view {currentRoute.label}
          </Typography>
        </Box>
      );
    }

    // Default welcome screen
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h1" sx={{ fontSize: "10rem" }}>
          👋
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Select a route above to explore different features
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "center" }}
      >
        {allowedRoutes.map((route) => (
          <Button
            key={route.path}
            variant="contained"
            onClick={() => navigateTo(route.path)}
            color={currentPath === route.path ? "secondary" : "primary"}
            size="large"
          >
            {route.icon} {route.label}
          </Button>
        ))}
        {!hasAnyAccess && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            No routes available with your current permissions
          </Typography>
        )}
      </Stack>

      {renderContent()}
    </Box>
  );
};
