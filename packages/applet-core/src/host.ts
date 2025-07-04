import { useApp } from "./AppContext";

// Hook for role management - for host applications only
export const useRoleManagement = () => {
  const { state, roleUtils } = useApp();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]]; // Default to first role (usually Guest)

  return {
    userRoles,
    availableRoles: roleUtils.roles,
    setUserRoles: (_roles: string[]) => {
      // This would need to be implemented in the app context
    },
    // Permission checking available for host convenience
    hasPermission: (appletId: string, permission: string) =>
      roleUtils.hasPermission(userRoles, appletId, permission),
    hasAnyPermission: (appletId: string, permissions: string[]) =>
      roleUtils.hasAnyPermission(userRoles, appletId, permissions),
    hasAllPermissions: (appletId: string, permissions: string[]) =>
      roleUtils.hasAllPermissions(userRoles, appletId, permissions),
    isAuthenticated: state.isAuthenticated,
  };
};

// Hook for navigation management - for host applications only
export const useNavigation = () => {
  const { state, actions, roleUtils } = useApp();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]];

  const filteredNavigation = state.navigation.filter((item) => {
    // Check permission-based access (recommended approach)
    if (item.requiredPermissions && item.appletId) {
      return roleUtils.hasAnyPermission(
        userRoles,
        item.appletId,
        item.requiredPermissions,
      );
    }

    // Default: show item if no restrictions
    return true;
  });

  return {
    navigation: filteredNavigation,
    setNavigation: actions.setNavigation,
  };
};

// Re-export useUser for host applications that need user management
export { useUser } from "./hooks";

// Host utility functions
import { AppletMount, HostAppletRoute } from "./types";

/**
 * Get all routes from all applets
 */
export function getAllRoutes(
  applets: AppletMount[],
): HostAppletRoute[] {
  const appletRoutes = applets.flatMap((applet) => applet.routes);
  return appletRoutes;
}

/**
 * Get the current applet based on path
 */
export function getCurrentApplet(
  path: string,
  applets: AppletMount[],
) {
  // Check if path matches any route in any applet
  for (const hostApplet of applets) {
    for (const route of hostApplet.routes) {
      if (path.startsWith(route.path)) {
        return hostApplet;
      }
    }
  }
  return null;
}
