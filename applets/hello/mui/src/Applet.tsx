import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useInternalNavigation } from "@smbc/applet-core";
import { navigationGroups, internalRoutes } from "./navigation";

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
    // Check if we have a current route and can access it
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
          Select a route above to see different views
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center" }}>
        Hello Applet
      </Typography>

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
