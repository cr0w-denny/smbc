import { useMemo } from 'react';
import type { AppletMount, HostRoute, MenuNavigationSection } from '@smbc/applet-core';

export interface UseAppletMenusOptions {
  applets: AppletMount[];
  hasAnyPermission: (appletId: string, permissions: string[]) => boolean;
  permissionMapping?: Record<string, string>;
  includeRootRoute?: boolean;
  rootRoute?: Partial<HostRoute>;
  includeInternalRoutes?: boolean;
}

/**
 * A headless hook that generates permission-filtered menu structures from applet definitions.
 * Transforms applet configurations into menu sections that can be consumed by UI components like TreeMenu.
 * 
 * @example
 * ```tsx
 * const { hasAnyPermission } = useRoleManagement();
 * const { menuSections } = useAppletMenus({
 *   applets,
 *   hasAnyPermission,
 *   includeRootRoute: true,
 *   rootRoute: { path: "/", label: "Dashboard", icon: DashboardIcon }
 * });
 * 
 * // Use menuSections to build navigation UI
 * <TreeMenu menuSections={menuSections} currentPath={path} onNavigate={navigate} />
 * ```
 */
export function useAppletMenus({
  applets,
  hasAnyPermission,
  permissionMapping = {},
  includeRootRoute = false,
  rootRoute = { path: "/", label: "Dashboard" },
  includeInternalRoutes = false,
}: UseAppletMenusOptions): { rootRoute?: HostRoute; menuSections: MenuNavigationSection[] } {
  const menuStructure = useMemo(() => {
    const menuSections: MenuNavigationSection[] = [];

    applets.forEach(applet => {
      const appletId = permissionMapping[applet.id] || applet.id;
      const appletMountPath = applet.routes?.[0]?.path || `/${applet.id}`;
      
      // Check if user has permission to access this applet at all
      const topLevelRoute = applet.routes?.[0];
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
            homeRoute: internalNav.homeRoute,
            groups: internalNav.groups,
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

  return menuStructure;
}