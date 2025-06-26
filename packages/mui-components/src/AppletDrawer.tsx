import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Chip,
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

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
 * Props for the AppletNavigation component
 */
export interface AppletNavigationProps {
  /** Current active path */
  currentPath: string;
  /** Function to handle navigation */
  onNavigate: (path: string) => void;
  /** Array of navigation routes */
  routes: NavigationRoute[];
  /** Whether to show debug info (applet count chip) */
  showDebugInfo?: boolean;
  /** Number of total applets for debug display */
  totalApplets?: number;
}

/**
 * Navigation component that renders a list of navigable routes
 * with proper selection highlighting and permission-based filtering
 */
export function AppletNavigation({
  currentPath,
  onNavigate,
  routes,
  showDebugInfo = false,
  totalApplets = 0,
}: AppletNavigationProps) {
  const handleNavigation = (path: string) => {
    onNavigate(path);
  };

  return (
    <List>
      {routes.map((route) => {
        const IconComponent = route.icon;
        const isSelected = currentPath === route.path;

        return (
          <ListItem key={route.path} disablePadding>
            <ListItemButton
              selected={isSelected}
              onClick={() => handleNavigation(route.path)}
            >
              <ListItemIcon>
                {IconComponent ? <IconComponent /> : <DashboardIcon />}
              </ListItemIcon>
              <ListItemText primary={route.label} />
              {/* Show applet count for debug */}
              {route.path === "/" && showDebugInfo && (
                <Chip
                  label={totalApplets}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
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
  /** Array of navigation routes */
  routes: NavigationRoute[];
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
  routes,
  showDebugInfo = false,
  totalApplets = 0,
  headerContent,
  footerContent,
  sx,
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
      
      {headerContent && (
        <Box sx={{ px: 2, py: 1 }}>
          {headerContent}
        </Box>
      )}
      
      <AppletNavigation
        currentPath={currentPath}
        onNavigate={onNavigate}
        routes={routes}
        showDebugInfo={showDebugInfo}
        totalApplets={totalApplets}
      />
      
      {footerContent && (
        <Box sx={{ px: 2, py: 1, mt: 'auto' }}>
          {footerContent}
        </Box>
      )}
    </Drawer>
  );
}