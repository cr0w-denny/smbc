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
  const { path, currentRoute, canAccess } = useInternalNavigation({
    appletId: "hello",
    mountPath,
    routes,
    navigationGroups,
  });

  const renderContent = () => {
    if (path === "/introduction" && canAccess(path)) {
      return <Introduction key={path} />;
    }

    if (path === "/develop" && canAccess(path)) {
      return <Develop key={path} />;
    }

    if (path === "/deploy" && canAccess(path)) {
      return <Deploy key={path} />;
    }

    if (path === "/integrate" && canAccess(path)) {
      return <Integrate key={path} />;
    }

    if (currentRoute && !canAccess(path)) {
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
    return <Introduction key="/introduction" />;
  };

  return <Box>{renderContent()}</Box>;
};
