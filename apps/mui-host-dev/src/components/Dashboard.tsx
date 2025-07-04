import React from "react";
import {
  useRoleManagement,
  useUser,
  useApp,
  usePersistedRoles,
  useAppletPermissions,
  type RoleConfig,
  type AppletMount,
} from "@smbc/applet-core";
import { RoleManagement } from "@smbc/mui-applet-core";
import type { PermissionGroup } from "@smbc/mui-components";

interface DashboardProps {
  hostApplets: AppletMount[];
  roleConfig: RoleConfig;
}

export const Dashboard = React.memo(function Dashboard({
  hostApplets,
  roleConfig,
}: DashboardProps) {
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