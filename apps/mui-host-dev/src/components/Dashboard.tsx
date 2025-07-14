import {
  useRoleManagement,
  useUser,
  useAppletCore,
  usePersistedRoles,
  useAppletPermissions,
  type RoleConfig,
  type AppletMount,
} from "@smbc/applet-core";
import { RoleManager, type PermissionGroup } from "@smbc/mui-applet-devtools";

interface DashboardProps {
  hostApplets: AppletMount[];
  roleConfig: RoleConfig;
}

export function Dashboard({
  hostApplets,
  roleConfig,
}: DashboardProps) {
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
    hostApplets,
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
}