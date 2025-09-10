import React from "react";
import { Box, Toolbar } from "@mui/material";
import {
  useHashNavigation,
  useUser,
  useAppletCore,
  usePersistedRoles,
  useAppletPermissions,
  type AppletMount,
  type RoleConfig,
} from "@smbc/applet-core";
import { getAllRoutes, useRoleManagement } from "@smbc/applet-host";
import { RoleManager, type PermissionGroup } from "./RoleManager";

export interface MuiAppletRouterProps {
  applets: AppletMount[];
  roleConfig: RoleConfig;
  drawerWidth?: number;
  showDashboard?: boolean;
}

/**
 * MUI styled AppletRouter with layout, loading states, and dashboard integration.
 * Provides a complete routing solution for MUI-based host applications.
 *
 * Features:
 * - Automatic layout adjustment for drawer
 * - Loading states during initial render
 * - Built-in dashboard/role management at root path
 * - Fallback to dashboard for unmatched routes
 *
 * @example
 * ```tsx
 * <MuiAppletRouter
 *   applets={applets}
 *   roleConfig={roleConfig}
 *   drawerWidth={240}
 *   showDashboard={true}
 * />
 * ```
 */
export function MuiAppletRouter({
  applets,
  roleConfig,
  drawerWidth = 240,
  showDashboard = true,
}: MuiAppletRouterProps) {
  const { path } = useHashNavigation();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // Memoize allRoutes to prevent recreating the array on every render
  const allRoutes = React.useMemo(
    () => getAllRoutes(applets),
    [applets.length],
  );

  // Clear initial load flag when we have applets and a valid route
  React.useEffect(() => {
    if (applets.length > 0) {
      // Use a small delay to ensure the component has time to render the loading state
      const timer = setTimeout(() => setIsInitialLoad(false), 50);
      return () => clearTimeout(timer);
    }
  }, [applets.length]);

  // Dashboard component with role management
  const DashboardComponent = React.useMemo(
    () => () => {
      const { userRoles } = useRoleManagement();
      const { user, availableRoles, setRoles } = useUser();
      const { roleUtils } = useAppletCore();

      const { selectedRoles, toggleRole } = usePersistedRoles({
        userRoles,
        availableRoles,
        storageKey: "roleMapping-selectedRoles",
        onRolesChange: setRoles,
      });

      const appletPermissions = useAppletPermissions({
        hostApplets: applets,
        roleConfig,
        selectedRoles,
        hasPermission: roleUtils.hasPermission,
      });

      return (
        <RoleManager
          user={user || undefined}
          availableRoles={availableRoles}
          selectedRoles={selectedRoles}
          onRoleToggle={toggleRole}
          appletPermissions={appletPermissions as PermissionGroup[]}
          localStorageKey="roleMapping-selectedRoles"
        />
      );
    },
    [applets, roleConfig],
  );

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        position: "relative",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Toolbar />
      {/* Show subtle loading state on initial load if not on root path */}
      {isInitialLoad && path !== "/" ? (
        <Box
          sx={{
            minHeight: "50vh",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: 1,
          }}
        />
      ) : /* Simple routing - render dashboard or find matching applet */
      path === "/" && showDashboard ? (
        <DashboardComponent />
      ) : (
        (() => {
          // Find the current route
          const currentRoute = allRoutes.find(
            (route) =>
              route.path === path ||
              (path !== "/" &&
                route.path !== "/" &&
                path.startsWith(route.path)),
          );

          if (currentRoute) {
            const RouteComponent = currentRoute.component;
            return <RouteComponent />;
          }

          // Fallback to dashboard if enabled, otherwise show nothing
          return showDashboard ? <DashboardComponent /> : null;
        })()
      )}
    </Box>
  );
}
