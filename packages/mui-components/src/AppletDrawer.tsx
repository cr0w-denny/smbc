import React from "react";
import {
  Box,
  Drawer,
  Typography,
  Toolbar,
} from "@mui/material";
import { TreeMenu } from "./TreeMenu";

/**
 * Navigation route interface
 */
export interface NavigationRoute {
  path: string;
  label: string;
  icon?: React.ComponentType | React.ElementType;
  component?: React.ComponentType;
  requiredPermissions?: string[];
}

/**
 * Tree menu navigation interfaces
 */
export interface TreeMenuGroup {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  routes: NavigationRoute[];
}

export interface TreeMenuSection {
  appletId: string;
  appletLabel: string;
  appletIcon?: React.ComponentType | React.ElementType | string;
  hasInternalNavigation: boolean;
  directRoute?: NavigationRoute;
  homeRoute?: NavigationRoute;
  groups?: TreeMenuGroup[];
}


/**
 * Props for the AppletDrawer component
 */
export interface AppletDrawerProps {
  /** Title to display in the drawer header */
  title?: string;
  /** Width of the drawer */
  width?: number;
  /** Current active path */
  currentPath: string;
  /** Function to handle navigation */
  onNavigate: (path: string) => void;
  /** Root route (usually Dashboard) */
  rootRoute?: NavigationRoute;
  /** Tree menu applet sections */
  appletSections: TreeMenuSection[];
  /** Whether to show debug info */
  showDebugInfo?: boolean;
  /** Number of total applets for debug display */
  totalApplets?: number;
  /** Custom content to render above navigation */
  headerContent?: React.ReactNode;
  /** Custom content to render below navigation */
  footerContent?: React.ReactNode;
  /** Custom styling for the drawer */
  sx?: any;
  /** Current search term for auto-expanding matching nodes */
  searchTerm?: string;
}

/**
 * A reusable drawer component for application navigation
 * that provides a consistent sidebar with navigation items
 *
 * @example
 * ```tsx
 * <AppletDrawer
 *   title="My Application"
 *   currentPath={currentPath}
 *   onNavigate={handleNavigate}
 *   routes={navigationRoutes}
 *   width={240}
 *   showDebugInfo={true}
 *   totalApplets={5}
 * />
 * ```
 */
export function AppletDrawer({
  title = "Application",
  width = 240,
  currentPath,
  onNavigate,
  rootRoute,
  appletSections,
  showDebugInfo = false,
  totalApplets = 0,
  headerContent,
  footerContent,
  sx,
  searchTerm,
}: AppletDrawerProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
        },
        ...sx,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
      </Toolbar>

      {headerContent && <Box sx={{ px: 2, py: 1 }}>{headerContent}</Box>}

      <TreeMenu
        currentPath={currentPath}
        onNavigate={onNavigate}
        rootRoute={rootRoute}
        appletSections={appletSections}
        showDebugInfo={showDebugInfo}
        totalApplets={totalApplets}
        searchTerm={searchTerm}
      />

      {footerContent && (
        <Box sx={{ px: 2, py: 1, mt: "auto" }}>{footerContent}</Box>
      )}
    </Drawer>
  );
}
