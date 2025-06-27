import {
  useUser,
  useApp,
  useRoleManagement,
  usePersistedRoles,
  useAppletPermissions,
} from "@smbc/applet-core";
import { RoleManagement } from "@smbc/mui-applet-core";
import type { PermissionGroup } from "@smbc/mui-components";
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
    <RoleManagement
      user={user || undefined}
      availableRoles={availableRoles}
      selectedRoles={selectedRoles}
      onRoleToggle={toggleRole}
      appletPermissions={appletPermissions as PermissionGroup[]}
      localStorageKey="roleMapping-selectedRoles"
    />
  );
}
