import React from "react";
import { Box, Typography } from "@mui/material";
import { useInternalNavigation } from "@smbc/applet-core";
import { navigationGroups, internalRoutes } from "./navigation";
import { Introduction } from "./components/introduction";
import { Develop } from "./components/develop";
import { Deploy } from "./components/deploy";
import { Integrate } from "./components/integrate";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

const routes = internalRoutes.map((route) => ({
  ...route,
  title: route.label,
}));

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  const { currentPath, currentRoute, canAccess } = useInternalNavigation({
    appletId: "hello",
    mountPath,
    routes,
    navigationGroups,
  });

  const renderContent = () => {
    if (currentPath === "/introduction" && canAccess(currentPath)) {
      return <Introduction />;
    }

    if (currentPath === "/develop" && canAccess(currentPath)) {
      return <Develop />;
    }

    if (currentPath === "/deploy" && canAccess(currentPath)) {
      return <Deploy />;
    }

    if (currentPath === "/integrate" && canAccess(currentPath)) {
      return <Integrate />;
    }

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

    // Default to Introduction page when no specific route is selected
    return <Introduction />;
  };

  return <Box>{renderContent()}</Box>;
};
