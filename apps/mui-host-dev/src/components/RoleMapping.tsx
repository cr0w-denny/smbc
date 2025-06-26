import { useUser, useApp } from "@smbc/mui-applet-host";
import { useRoleManagement } from "@smbc/mui-applet-host";
import {
  RolePermissionDashboard,
  usePersistedRoles,
  useAppletPermissions,
  type PermissionGroup,
} from "@smbc/mui-applet-host";
import { APPLETS, applets, roleConfig } from "../app.config";

export function RoleMapping() {
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
    hostApplets: APPLETS,
    originalApplets: applets,
    roleConfig,
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  return (
    <RolePermissionDashboard
      user={user || undefined}
      availableRoles={availableRoles}
      selectedRoles={selectedRoles}
      onRoleToggle={toggleRole}
      appletPermissions={appletPermissions as PermissionGroup[]}
      localStorageKey="roleMapping-selectedRoles"
    />
  );
}
