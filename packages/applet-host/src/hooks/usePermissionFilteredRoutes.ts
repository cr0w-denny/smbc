import React from "react";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  requiredPermissions?: string[];
  [key: string]: any;
}

export interface AppletConfig {
  id: string;
  routes: Array<{
    path: string;
    [key: string]: any;
  }>;
}

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