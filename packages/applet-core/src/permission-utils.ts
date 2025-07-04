import type { RoleConfig } from './types';

/**
 * Convert user roles to a flat list of permissions
 * This bridges the current role system with the new flat permission approach
 */
export function calculatePermissionsFromRoles(
  userRoles: string[],
  roleConfig: RoleConfig,
): string[] {
  const permissions: string[] = [];
  
  // Iterate through all permission mappings
  Object.entries(roleConfig.permissionMappings || {}).forEach(
    ([appletId, appletPermissions]) => {
      Object.entries(appletPermissions).forEach(
        ([permissionId, requiredRoles]) => {
          // Check if user has any of the required roles for this permission
          const hasPermission = userRoles.some((userRole) =>
            requiredRoles.includes(userRole),
          );
          
          if (hasPermission) {
            permissions.push(`${appletId}:${permissionId}`);
          }
        },
      );
    },
  );
  
  return permissions;
}