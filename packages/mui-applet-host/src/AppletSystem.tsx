import React from "react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import {
  AppletDrawer as BaseAppletDrawer,
  type NavigationRoute,
} from "@smbc/mui-components";
import {
  AppletRouter,
  useHashNavigation,
  usePermissionFilteredRoutes,
  useRoleManagement,
} from "@smbc/applet-core";
import { getAllRoutes, HostAppletDefinition } from "@smbc/applet-core";

interface AppletSystemProps {
  applets: HostAppletDefinition[];
  appConstants: {
    drawerWidth: number;
    appName: string;
  };
  dashboardComponent?: React.ComponentType;
  title?: string;
  permissionMapping?: Record<string, string>;
}

function useAppletRoutes(
  applets: HostAppletDefinition[],
  permissionMapping: Record<string, string> = {},
): NavigationRoute[] {
  const { hasAnyPermission, userRoles } = useRoleManagement();
  const appletRoutes = getAllRoutes(applets);

  const filteredAppletRoutes = usePermissionFilteredRoutes({
    routes: appletRoutes,
    applets,
    hasAnyPermission,
    userRoles,
    permissionMapping,
  });

  // Convert HostAppletRoute to NavigationRoute (they have the same structure)
  return React.useMemo(
    () => [
      {
        path: "/",
        label: "Dashboard",
        icon: DashboardIcon,
        component: () => null,
      }, // Dashboard is always accessible
      ...filteredAppletRoutes.map(
        (route: any): NavigationRoute => ({
          path: route.path,
          label: route.label,
          icon: route.icon,
          component: route.component,
          requiredPermissions: route.requiredPermissions,
        }),
      ),
    ],
    [filteredAppletRoutes],
  );
}

export function AppletDrawer({
  applets,
  appConstants,
  title,
  permissionMapping = {},
}: AppletSystemProps) {
  const { currentPath, navigateTo } = useHashNavigation();
  const routes = useAppletRoutes(applets, permissionMapping);

  return (
    <BaseAppletDrawer
      title={title || appConstants.appName}
      width={appConstants.drawerWidth}
      currentPath={currentPath}
      onNavigate={navigateTo}
      routes={routes}
      showDebugInfo={true}
      totalApplets={applets.length}
    />
  );
}

export function AppletRoutes({
  applets,
  dashboardComponent,
  permissionMapping = {},
}: AppletSystemProps) {
  const { currentPath } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  const allRoutes = getAllRoutes(applets);

  const DashboardComponent = dashboardComponent || (() => <div>Dashboard</div>);

  return (
    <AppletRouter
      currentPath={currentPath}
      routes={allRoutes}
      applets={applets}
      hasAnyPermission={hasAnyPermission}
      dashboardComponent={DashboardComponent}
      permissionMapping={permissionMapping}
    />
  );
}
