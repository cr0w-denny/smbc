import { useAppletCore } from "../AppContext";
import type { PermissionDefinition } from "../permissions";

/**
 * Hook for permission-based access control - for applets
 */
export const usePermissions = () => {
  const { state, roleUtils } = useAppletCore();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]]; // Default to first role (usually Guest)

  return {
    hasPermission: (appletId: string, permission: PermissionDefinition) =>
      roleUtils.hasPermission(userRoles, appletId, permission.id),
    hasAnyPermission: (appletId: string, permissions: PermissionDefinition[]) =>
      roleUtils.hasAnyPermission(
        userRoles,
        appletId,
        permissions.map((p) => p.id),
      ),
    hasAllPermissions: (
      appletId: string,
      permissions: PermissionDefinition[],
    ) =>
      roleUtils.hasAllPermissions(
        userRoles,
        appletId,
        permissions.map((p) => p.id),
      ),
  };
};