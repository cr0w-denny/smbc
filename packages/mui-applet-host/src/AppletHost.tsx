import React from "react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { Box, Toolbar } from "@mui/material";
import {
  AppletDrawer as BaseAppletDrawer,
  type NavigationRoute,
} from "@smbc/mui-components";
import {
  AppletRouter,
  useHashNavigation,
  usePermissionFilteredRoutes,
  useRoleManagement,
  type RoleConfig,
} from "@smbc/applet-core";
import { RoleManagement } from "@smbc/mui-applet-core";
import type { PermissionGroup } from "@smbc/mui-components";
import {
  useUser,
  useApp,
  usePersistedRoles,
  useAppletPermissions,
} from "@smbc/applet-core";
import { getAllRoutes, HostAppletDefinition } from "@smbc/applet-core";

interface AppletHostProps {
  applets: HostAppletDefinition[];
  constants: {
    drawerWidth: number;
    appName: string;
  };
  roleConfig: RoleConfig;
  permissionMapping?: Record<string, string>;
  title?: string;
}

function useAppletRoutes(
  applets: HostAppletDefinition[], 
  permissionMapping: Record<string, string> = {}
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

// Dashboard component extracted to prevent recreation
const Dashboard = React.memo(function Dashboard({ 
  hostApplets, 
  roleConfig 
}: { 
  hostApplets: HostAppletDefinition[], 
  roleConfig: RoleConfig 
}) {
  const { userRoles } = useRoleManagement();
  const { user, availableRoles, setRoles } = useUser();
  const { roleUtils } = useApp();

  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles,
    availableRoles,
    storageKey: "roleMapping-selectedRoles",
    onRolesChange: setRoles,
  });

  const appletPermissions = useAppletPermissions({
    hostApplets,
    roleConfig,
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  return (
    <RoleManagement
      user={user || undefined}
      availableRoles={availableRoles}
      selectedRoles={selectedRoles}
      onRoleToggle={toggleRole}
      appletPermissions={appletPermissions as PermissionGroup[]}
      localStorageKey="roleMapping-selectedRoles"
    />
  );
});

export function AppletHost({
  applets,
  constants,
  roleConfig,
  permissionMapping = {},
  title,
}: AppletHostProps) {
  const { currentPath, navigateTo } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  const routes = useAppletRoutes(applets, permissionMapping);
  const allRoutes = getAllRoutes(applets);

  const DashboardComponent = React.useMemo(() => 
    () => (
      <Dashboard 
        hostApplets={applets}
        roleConfig={roleConfig}
      />
    ), [applets, roleConfig]
  );

  return (
    <>
      {/* Drawer */}
      <BaseAppletDrawer
        title={title || constants.appName}
        width={constants.drawerWidth}
        currentPath={currentPath}
        onNavigate={navigateTo}
        routes={routes}
        showDebugInfo={true}
        totalApplets={applets.length}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${constants.drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <AppletRouter
          currentPath={currentPath}
          routes={allRoutes}
          applets={applets}
          hasAnyPermission={hasAnyPermission}
          dashboardComponent={DashboardComponent}
          permissionMapping={permissionMapping}
        />
      </Box>
    </>
  );
}