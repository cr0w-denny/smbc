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
import { RoleMapping } from "./RoleMapping";
import { APP_CONSTANTS, APPLETS, getAllRoutes } from "../app.config";

function useAppletRoutes(): NavigationRoute[] {
  const { hasAnyPermission, userRoles } = useRoleManagement();
  const appletRoutes = getAllRoutes();

  const filteredAppletRoutes = usePermissionFilteredRoutes({
    routes: appletRoutes,
    applets: APPLETS,
    hasAnyPermission,
    userRoles,
    permissionMapping: {
      "admin-users": "user-management", // admin-users uses user-management permissions
    },
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

export function AppletDrawer() {
  const { currentPath, navigateTo } = useHashNavigation();
  const routes = useAppletRoutes();

  return (
    <BaseAppletDrawer
      title="SMBC Applet Host"
      width={APP_CONSTANTS.drawerWidth}
      currentPath={currentPath}
      onNavigate={navigateTo}
      routes={routes}
      showDebugInfo={true}
      totalApplets={APPLETS.length}
    />
  );
}

export function AppletRoutes() {
  const { currentPath } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  const allRoutes = getAllRoutes();

  return (
    <AppletRouter
      currentPath={currentPath}
      routes={allRoutes}
      applets={APPLETS}
      hasAnyPermission={hasAnyPermission}
      dashboardComponent={AppletDashboard}
      permissionMapping={{
        "admin-users": "user-management", // admin-users uses user-management permissions
      }}
    />
  );
}

function AppletDashboard() {
  return <RoleMapping />;
}
