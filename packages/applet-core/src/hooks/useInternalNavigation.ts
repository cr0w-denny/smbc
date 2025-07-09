import { useMemo } from 'react';
import { useHashNavigation, usePermissions } from './index';
import type { PermissionDefinition } from '../permissions';
import type { NavigationGroup, NavigationGroupDefinition } from '../types';

export interface InternalRouteConfig {
  path: string;
  permission: PermissionDefinition;
  label: string;
  icon?: string;
  group?: string;
  [key: string]: any; // Allow any additional props the user wants
}

export interface UseInternalNavigationOptions {
  appletId: string;
  mountPath: string;
  routes: InternalRouteConfig[];
  navigationGroups?: NavigationGroupDefinition[];
}

/**
 * A headless hook that provides permission-aware routing logic for internal applet navigation.
 * Returns navigation state and helpers without imposing any UI.
 * 
 * @example
 * ```tsx
 * const { currentPath, navigateTo, allowedRoutes, canAccess } = useInternalNavigation({
 *   appletId: "hello",
 *   mountPath: "/hello", 
 *   routes: [
 *     { path: "/route-one", permission: permissions.VIEW_ROUTE_ONE, label: "Route One", icon: "🚀" },
 *     { path: "/route-two", permission: permissions.VIEW_ROUTE_TWO, label: "Route Two", icon: "🌟" }
 *   ]
 * });
 * 
 * return (
 *   <div>
 *     {allowedRoutes.map(route => (
 *       <button key={route.path} onClick={() => navigateTo(route.path)}>
 *         {route.icon} {route.label}
 *       </button>
 *     ))}
 *     {canAccess(currentPath) ? <RouteContent /> : <AccessDenied />}
 *   </div>
 * );
 * ```
 */

function buildNavigationGroups(
  allowedRoutes: InternalRouteConfig[],
  groups: NavigationGroupDefinition[] = [],
  mountPath: string
): NavigationGroup[] {
  // Group routes by their group property
  const routesByGroup = allowedRoutes.reduce((acc, route) => {
    const groupId = route.group || 'default';
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push({
      path: `${mountPath}${route.path}`,
      label: route.label,
      icon: route.icon,
      component: undefined, // InternalRouteConfig doesn't have component
      requiredPermissions: [], // We'll handle permissions separately
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Only return groups that have accessible routes
  return groups
    .filter(group => routesByGroup[group.id]?.length > 0)
    .map(group => ({
      ...group,
      routes: routesByGroup[group.id]
    }));
}

export function useInternalNavigation({
  appletId,
  mountPath,
  routes,
  navigationGroups = [],
}: UseInternalNavigationOptions) {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);
  const { hasPermission } = usePermissions();

  // Memoize permission checks to avoid unnecessary re-renders
  const allowedRoutes = useMemo(() => {
    return routes.filter(route => 
      hasPermission(appletId, route.permission)
    );
  }, [routes, appletId, hasPermission]);

  // Helper to check if user can access a specific path
  const canAccess = useMemo(() => {
    return (path: string) => {
      const route = routes.find(r => r.path === path);
      if (!route) return false;
      return hasPermission(appletId, route.permission);
    };
  }, [routes, appletId, hasPermission]);

  // Find current route
  const currentRoute = useMemo(() => {
    return routes.find(route => route.path === currentPath);
  }, [routes, currentPath]);

  // Build navigation groups for host consumption
  const hostNavigationGroups = useMemo(() => {
    return buildNavigationGroups(allowedRoutes, navigationGroups, mountPath);
  }, [allowedRoutes, navigationGroups, mountPath]);


  return {
    currentPath,
    navigateTo,
    routes,
    allowedRoutes,
    currentRoute,
    canAccess,
    hasAnyAccess: allowedRoutes.length > 0,
    hostNavigationGroups,
  };
}