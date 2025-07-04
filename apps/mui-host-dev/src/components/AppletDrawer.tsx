import React from "react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import {
  useHashNavigation,
  useHostNavigation,
  useRoleManagement,
  type HostAppletDefinition,
} from "@smbc/applet-core";
import {
  AppletDrawer as BaseAppletDrawer,
  type NavigationRoute,
} from "@smbc/mui-components";

interface AppletDrawerProps {
  applets: HostAppletDefinition[];
  constants: {
    drawerWidth: number;
    appName: string;
  };
  title?: string;
  permissionMapping?: Record<string, string>;
}


export function AppletDrawer({
  applets,
  constants,
  title,
  permissionMapping = {},
}: AppletDrawerProps) {
  const { currentPath, navigateTo } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  
  const { rootRoute, appletSections } = useHostNavigation({
    applets,
    hasAnyPermission,
    permissionMapping,
    includeRootRoute: true,
    rootRoute: { path: "/", label: "Dashboard", icon: DashboardIcon },
    includeInternalRoutes: true
  });

  // Convert types to match BaseAppletDrawer expectations
  const hierarchicalSections = React.useMemo(() => 
    appletSections.map(section => ({
      ...section,
      groups: section.groups?.map(group => ({
        ...group,
        routes: group.routes.map(route => ({
          ...route,
          icon: typeof route.icon === 'string' 
            ? () => <span>{route.icon}</span>
            : route.icon,
        }))
      })),
      directRoute: section.directRoute ? {
        ...section.directRoute,
        icon: typeof section.directRoute.icon === 'string' 
          ? () => <span>{section.directRoute.icon}</span>
          : section.directRoute.icon,
      } : undefined,
      homeRoute: section.homeRoute ? {
        ...section.homeRoute,
        icon: typeof section.homeRoute.icon === 'string' 
          ? () => <span>{section.homeRoute.icon}</span>
          : section.homeRoute.icon,
      } : undefined,
    })), 
    [appletSections]
  );

  const convertedRootRoute = React.useMemo(() => 
    rootRoute ? {
      ...rootRoute,
      icon: typeof rootRoute.icon === 'string' 
        ? () => <span>{rootRoute.icon}</span>
        : rootRoute.icon,
    } : undefined, 
    [rootRoute]
  );

  return (
    <BaseAppletDrawer
      title={title || constants.appName}
      width={constants.drawerWidth}
      currentPath={currentPath}
      onNavigate={navigateTo}
      rootRoute={convertedRootRoute}
      appletSections={hierarchicalSections}
      showDebugInfo={true}
      totalApplets={applets.length}
    />
  );
}
