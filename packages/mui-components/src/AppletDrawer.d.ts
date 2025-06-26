import React from 'react';
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
export declare function AppletNavigation({ currentPath, onNavigate, routes, showDebugInfo, totalApplets, }: AppletNavigationProps): import("react/jsx-runtime").JSX.Element;
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
export declare function AppletDrawer({ title, width, currentPath, onNavigate, routes, showDebugInfo, totalApplets, headerContent, footerContent, sx, }: AppletDrawerProps): import("react/jsx-runtime").JSX.Element;
