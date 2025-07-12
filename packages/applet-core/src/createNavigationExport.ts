import type { HostRoute, HostNavigationGroup } from './types';

export interface NavigationConfig {
  /** Navigation groups to organize routes */
  groups?: Array<{
    id: string;
    label: string;
    icon?: string;
    order?: number;
  }>;
  
  /** Internal routes with their configuration */
  routes: Array<{
    path: string;
    label: string;
    icon?: string;
    group?: string;
    permission?: { id: string };
    requiredPermissions?: string[];
  }>;
  
  /** Home route configuration */
  homeRoute?: {
    label?: string;
    icon?: string;
    requiredPermissions?: string[];
  };
}

/**
 * Creates a function that exposes an applet's internal navigation to the host.
 * This provides a standard way for applets to share their navigation structure
 * with the host application, which can then display it in navigation drawers, menus, etc.
 * 
 * @example
 * ```typescript
 * import { createNavigationExport } from '@smbc/applet-core';
 * import permissions from './permissions';
 * 
 * // Define internal navigation structure
 * export const getHostNavigation = createNavigationExport({
 *   groups: [
 *     { id: 'users', label: 'User Management', icon: '👥' },
 *     { id: 'settings', label: 'Settings', icon: '⚙️' }
 *   ],
 *   routes: [
 *     { path: '/users', label: 'All Users', group: 'users', permission: permissions.VIEW_USERS },
 *     { path: '/users/active', label: 'Active Users', group: 'users', permission: permissions.VIEW_USERS },
 *     { path: '/settings/roles', label: 'Roles', group: 'settings', permission: permissions.MANAGE_ROLES }
 *   ],
 *   homeRoute: { label: 'Dashboard', icon: '🏠' }
 * });
 * ```
 */
export function createNavigationExport(config: NavigationConfig) {
  return function getHostNavigation(
    mountPath: string,
    hasAnyPermission: (appletId: string, permissions: string[]) => boolean,
    appletId: string
  ): {
    homeRoute?: HostRoute;
    groups: HostNavigationGroup[];
  } {
    // Filter routes by permissions
    const allowedRoutes = config.routes.filter(route => {
      const permissions = route.requiredPermissions || 
        (route.permission ? [route.permission.id] : []);
      
      if (permissions.length === 0) return true;
      return hasAnyPermission(appletId, permissions);
    });

    // If no groups defined, return flat structure without group headers
    if (!config.groups || config.groups.length === 0) {
      const routes: HostRoute[] = allowedRoutes.map(route => ({
        path: `${mountPath}${route.path}`,
        label: route.label,
        icon: route.icon,
        requiredPermissions: route.requiredPermissions || 
          (route.permission ? [route.permission.id] : []),
      }));

      return {
        homeRoute: config.homeRoute ? {
          path: mountPath,
          label: config.homeRoute.label || 'Home',
          icon: config.homeRoute.icon || '🏠',
          requiredPermissions: config.homeRoute.requiredPermissions || [],
        } : undefined,
        groups: routes.length > 0 ? [{
          id: 'flat',
          label: '', // Empty label = no group header
          routes
        }] : []
      };
    }

    // Group routes by their group property
    const routesByGroup = allowedRoutes.reduce((acc, route) => {
      const groupId = route.group || 'default';
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push({
        path: `${mountPath}${route.path}`,
        label: route.label,
        icon: route.icon,
        requiredPermissions: route.requiredPermissions || 
          (route.permission ? [route.permission.id] : []),
      });
      return acc;
    }, {} as Record<string, HostRoute[]>);

    // Build navigation groups - only include groups that have accessible routes
    const groups: HostNavigationGroup[] = config.groups
      .filter(group => routesByGroup[group.id]?.length > 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(group => ({
        ...group,
        routes: routesByGroup[group.id]
      }));

    // Return home route and groups
    return {
      homeRoute: config.homeRoute ? {
        path: mountPath,
        label: config.homeRoute.label || 'Home',
        icon: config.homeRoute.icon || '🏠',
        requiredPermissions: config.homeRoute.requiredPermissions || [],
      } : undefined,
      groups,
    };
  };
}

