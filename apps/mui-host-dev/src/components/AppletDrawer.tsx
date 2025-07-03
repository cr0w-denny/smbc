import React from "react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import {
  getAllRoutes,
  useHashNavigation,
  usePermissionFilteredRoutes,
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

  return React.useMemo(
    () => [
      {
        path: "/",
        label: "Dashboard",
        icon: DashboardIcon,
        component: () => null,
      },
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
  constants,
  title,
  permissionMapping = {},
}: AppletDrawerProps) {
  const { currentPath, navigateTo } = useHashNavigation();
  const routes = useAppletRoutes(applets, permissionMapping);

  return (
    <BaseAppletDrawer
      title={title || constants.appName}
      width={constants.drawerWidth}
      currentPath={currentPath}
      onNavigate={navigateTo}
      routes={routes}
      showDebugInfo={true}
      totalApplets={applets.length}
    />
  );
}
