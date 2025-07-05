import React from "react";
import {
  Box,
  Drawer,
  Typography,
  Toolbar,
} from "@mui/material";
import { TreeMenu, NavigationRoute, TreeMenuSection } from "./TreeMenu";

// Re-export types from TreeMenu for convenience
export type { NavigationRoute, TreeMenuSection } from "./TreeMenu";
export type { TreeMenuGroup } from "./TreeMenu";


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
  /** Tree menu sections */
  menuSections: TreeMenuSection[];
  /** Whether to show debug info */
  showDebugInfo?: boolean;
  /** Number of total sections for debug display */
  totalSections?: number;
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
  menuSections,
  showDebugInfo = false,
  totalSections = 0,
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
        menuSections={menuSections}
        showDebugInfo={showDebugInfo}
        totalSections={totalSections}
        searchTerm={searchTerm}
      />

      {footerContent && (
        <Box sx={{ px: 2, py: 1, mt: "auto" }}>{footerContent}</Box>
      )}
    </Drawer>
  );
}
