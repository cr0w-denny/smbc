import { useAppletCore } from "@smbc/applet-core";

// Hook for role management - for host applications only
export const useRoleManagement = () => {
  const { state, actions, roleUtils } = useAppletCore();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]]; // Default to first role (usually Guest)

  return {
    userRoles,
    availableRoles: roleUtils.roles,
    setUserRoles: actions.setUserRoles,
    // Permission checking available for host convenience
    hasPermission: (appletId: string, permission: string) =>
      roleUtils.hasPermission(userRoles, appletId, permission),
    hasAnyPermission: (appletId: string, permissions: string[]) =>
      roleUtils.hasAnyPermission(userRoles, appletId, permissions),
    hasAllPermissions: (appletId: string, permissions: string[]) =>
      roleUtils.hasAllPermissions(userRoles, appletId, permissions),
    isAuthenticated: state.isAuthenticated,
  };
};