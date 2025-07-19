import { useMemo } from 'react';
import type { AppletMount, HostRoute, MenuNavigationSection } from '@smbc/applet-core';

export interface UseHostNavigationOptions {
  applets: AppletMount[];
  hasAnyPermission: (appletId: string, permissions: string[]) => boolean;
  permissionMapping?: Record<string, string>;
  includeRootRoute?: boolean;
  rootRoute?: Partial<HostRoute>;
  includeInternalRoutes?: boolean;
}

/**
 * A headless hook that provides permission-filtered navigation routes for host applications.
 * Returns routes that the current user can access based on their permissions.
 * 
 * @example
 * ```tsx
 * const { hasAnyPermission } = useRoleManagement();
 * const routes = useHostNavigation({
 *   applets,
 *   hasAnyPermission,
 *   includeRootRoute: true,
 *   rootRoute: { path: "/", label: "Dashboard", icon: DashboardIcon }
 * });
 * 
 * // Use routes to build any navigation UI
 * ```
 */
export function useHostNavigation({
  applets,
  hasAnyPermission,
  permissionMapping = {},
  includeRootRoute = false,
  rootRoute = { path: "/", label: "Dashboard" },
  includeInternalRoutes = false,
}: UseHostNavigationOptions): { rootRoute?: HostRoute; menuSections: MenuNavigationSection[] } {
  const navigationStructure = useMemo(() => {
    const menuSections: MenuNavigationSection[] = [];

    applets.forEach(applet => {
      const appletId = permissionMapping[applet.id] || applet.id;
      const appletMountPath = applet.routes[0]?.path || `/${applet.id}`;
      
      // Check if user has permission to access this applet at all
      const topLevelRoute = applet.routes[0];
      if (topLevelRoute?.requiredPermissions && topLevelRoute.requiredPermissions.length > 0) {
        if (!hasAnyPermission(appletId, topLevelRoute.requiredPermissions)) {
          return; // Skip this applet entirely
        }
      }

      // Check if applet has internal navigation
      if (includeInternalRoutes && applet.getHostNavigation) {
        // Applet has internal navigation - create a section
        const internalNav = applet.getHostNavigation(
          appletMountPath,
          hasAnyPermission,
          appletId
        );

        // Only create section if there are groups or home route
        if (internalNav.groups.length > 0 || internalNav.homeRoute) {
          menuSections.push({
            sectionId: applet.id,
            sectionLabel: applet.label,
            sectionIcon: topLevelRoute?.icon,
            sectionVersion: applet.version,
            hasInternalNavigation: true,
            filterable: applet.filterable,
            homeRoute: internalNav.homeRoute ? {
              path: internalNav.homeRoute.path,
              label: internalNav.homeRoute.label,
              icon: internalNav.homeRoute.icon,
              component: internalNav.homeRoute.component,
              requiredPermissions: internalNav.homeRoute.requiredPermissions || [],
            } : undefined,
            groups: internalNav.groups.map(group => ({
              id: group.id,
              label: group.label,
              icon: group.icon,
              order: group.order,
              routes: group.routes.map(route => ({
                path: route.path,
                label: route.label,
                icon: route.icon,
                component: route.component,
                requiredPermissions: route.requiredPermissions || [],
              })),
            })),
          });
        } else {
          // No accessible internal routes, fall back to direct route
          menuSections.push({
            sectionId: applet.id,
            sectionLabel: applet.label,
            sectionIcon: topLevelRoute?.icon,
            sectionVersion: applet.version,
            hasInternalNavigation: false,
            filterable: applet.filterable,
            directRoute: {
              path: appletMountPath,
              label: applet.label,
              icon: topLevelRoute?.icon,
              component: topLevelRoute?.component,
              requiredPermissions: topLevelRoute?.requiredPermissions || [],
            },
          });
        }
      } else {
        // No internal navigation - create direct route
        menuSections.push({
          sectionId: applet.id,
          sectionLabel: applet.label,
          sectionIcon: topLevelRoute?.icon,
          sectionVersion: applet.version,
          hasInternalNavigation: false,
          filterable: applet.filterable,
          directRoute: {
            path: appletMountPath,
            label: applet.label,
            icon: topLevelRoute?.icon,
            component: topLevelRoute?.component,
            requiredPermissions: topLevelRoute?.requiredPermissions || [],
          },
        });
      }
    });

    return {
      rootRoute: includeRootRoute ? {
        path: "/",
        label: "Dashboard",
        component: () => null,
        ...rootRoute,
      } : undefined,
      menuSections,
    };
  }, [applets, hasAnyPermission, permissionMapping, includeRootRoute, rootRoute, includeInternalRoutes]);

  return navigationStructure;
}