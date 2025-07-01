import React from "react";

/**
 * Configuration for an applet with permission mapping
 */
export interface AppletConfig {
  id: string;
  routes: Array<{
    path: string;
    [key: string]: any;
  }>;
}

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  requiredPermissions?: string[];
  [key: string]: any;
}

/**
 * Props for the AppletRouter component
 */
export interface AppletRouterProps {
  /** Current path from navigation */
  currentPath: string;
  /** Array of available routes */
  routes: RouteConfig[];
  /** Array of applet configurations for permission mapping */
  applets: AppletConfig[];
  /** Function to check if user has any of the required permissions */
  hasAnyPermission: (appletId: string, permissions: string[]) => boolean;
  /** Component to render when access is denied */
  accessDeniedComponent?: React.ComponentType;
  /** Component to render for the dashboard/home route */
  dashboardComponent: React.ComponentType;
  /** Permission mapping for applet ID transformations */
  permissionMapping?: Record<string, string>;
}

/**
 * A reusable router component that handles permission-based routing
 * for applet systems with dynamic route matching and access control.
 *
 * @example
 * ```tsx
 * <AppletRouter
 *   currentPath={currentPath}
 *   routes={allRoutes}
 *   applets={APPLETS}
 *   hasAnyPermission={hasAnyPermission}
 *   dashboardComponent={Dashboard}
 *   accessDeniedComponent={AccessDenied}
 *   permissionMapping={{
 *     'admin-users': 'user-management'
 *   }}
 * />
 * ```
 */
export function AppletRouter({
  currentPath,
  routes,
  applets,
  hasAnyPermission,
  accessDeniedComponent: AccessDeniedComponent,
  dashboardComponent: DashboardComponent,
  permissionMapping = {},
}: AppletRouterProps) {
  // Handle dashboard route explicitly first
  if (currentPath === "/") {
    return <DashboardComponent />;
  }

  // Find the current route - check for exact match first, then prefix match
  let currentRoute = routes.find((route) => route.path === currentPath);

  // If no exact match, find a route that matches the beginning of the current path
  // This allows applets to handle their own sub-routing
  // Only do prefix matching for non-root paths
  if (!currentRoute && currentPath !== "/") {
    currentRoute = routes.find(
      (route) => route.path !== "/" && currentPath.startsWith(route.path),
    );
  }

  if (currentRoute) {
    // Check permissions before rendering the route
    if (
      currentRoute.requiredPermissions &&
      currentRoute.requiredPermissions.length > 0
    ) {
      // Find which applet this route belongs to
      const applet = applets.find((a) =>
        a.routes.some((r) => r.path === currentRoute!.path),
      );

      if (applet) {
        // Check if user has any of the required permissions
        // Apply permission mapping for applet ID transformations (for reused applets)
        let permissionAppletId = applet.id;
        if (permissionMapping[applet.id]) {
          permissionAppletId = permissionMapping[applet.id];
        }

        const hasPermission = hasAnyPermission(
          permissionAppletId,
          currentRoute.requiredPermissions,
        );

        if (!hasPermission) {
          // User doesn't have permission, show access denied
          return AccessDeniedComponent ? <AccessDeniedComponent /> : null;
        }
      }
    }

    const RouteComponent = currentRoute.component;
    return <RouteComponent />;
  }

  // Fallback to dashboard if route not found
  return <DashboardComponent />;
}

/**
 * Hook for filtering routes based on user permissions
 */
export interface UsePermissionFilteredRoutesProps {
  /** All available routes */
  routes: RouteConfig[];
  /** Array of applet configurations */
  applets: AppletConfig[];
  /** Function to check permissions */
  hasAnyPermission: (appletId: string, permissions: string[]) => boolean;
  /** User roles for memoization dependencies */
  userRoles: string[];
  /** Permission mapping for applet ID transformations */
  permissionMapping?: Record<string, string>;
}

/**
 * Hook that filters routes based on user permissions
 *
 * @example
 * ```tsx
 * const filteredRoutes = usePermissionFilteredRoutes({
 *   routes: allRoutes,
 *   applets: APPLETS,
 *   hasAnyPermission,
 *   userRoles,
 *   permissionMapping: { 'admin-users': 'user-management' }
 * });
 * ```
 */
export function usePermissionFilteredRoutes({
  routes,
  applets,
  hasAnyPermission,
  userRoles,
  permissionMapping = {},
}: UsePermissionFilteredRoutesProps): RouteConfig[] {
  return React.useMemo(() => {
    return routes.filter((route) => {
      if (
        !route.requiredPermissions ||
        route.requiredPermissions.length === 0
      ) {
        return true; // No permissions required
      }

      // Find which applet this route belongs to
      const applet = applets.find((a) =>
        a.routes.some((r) => r.path === route.path),
      );
      if (!applet) return false;

      // Apply permission mapping for applet ID transformations
      let permissionAppletId = applet.id;
      if (permissionMapping[applet.id]) {
        permissionAppletId = permissionMapping[applet.id];
      }

      return hasAnyPermission(permissionAppletId, route.requiredPermissions);
    });
  }, [routes, applets, hasAnyPermission, userRoles, permissionMapping]);
}
