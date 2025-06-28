import {
  HostAppletDefinition,
  useUser,
  useApp,
  useRoleManagement,
  usePersistedRoles,
  useAppletPermissions,
  type RoleConfig,
} from "@smbc/applet-core";
import { RoleManagement } from "@smbc/mui-applet-core";
import type { PermissionGroup } from "@smbc/mui-components";

interface RoleMappingProps {
  hostApplets: HostAppletDefinition[];
  originalApplets: any[];
  roleConfig: RoleConfig;
  storageKey?: string;
}

export function RoleMapping({
  hostApplets,
  roleConfig,
  storageKey = "roleMapping-selectedRoles",
}: RoleMappingProps) {
  const { userRoles } = useRoleManagement();
  const { user, availableRoles, setRoles } = useUser();
  const { roleUtils } = useApp();

  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles,
    availableRoles,
    storageKey,
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
      localStorageKey={storageKey}
    />
  );
}
