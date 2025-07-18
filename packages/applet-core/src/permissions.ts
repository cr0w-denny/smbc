import type { RoleConfig } from './types';

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

/**
 * Base permission definition structure
 */
export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category?: string;
}

/**
 * Collection of permissions for an applet
 */
export interface AppletPermissionSet {
  [key: string]: PermissionDefinition;
}

/**
 * Helper to create type-safe permission declarations with preserved autocomplete
 * 
 * @param appletId - The applet identifier
 * @param permissions - Object mapping permission keys to descriptions
 * @returns Type-safe permission definitions
 * 
 * @example
 * ```typescript
 * const USER_PERMISSIONS = definePermissions("user-management", {
 *   VIEW_USERS: "View user list and profiles",
 *   CREATE_USERS: "Create new users",
 *   DELETE_USERS: "Delete users"
 * });
 * ```
 */
export const definePermissions = <T extends Record<string, string>>(
  appletId: string,
  permissions: T,
): { [K in keyof T]: PermissionDefinition } => {
  const result = {} as { [K in keyof T]: PermissionDefinition };

  for (const [key, description] of Object.entries(permissions)) {
    (result as any)[key] = {
      id: `${appletId}:${key.toLowerCase()}`,
      name: key,
      description,
    };
  }

  return result;
};

// =============================================================================
// PERMISSION REQUIREMENTS & MAPPINGS
// =============================================================================

/**
 * Permission requirement definition
 */
export interface PermissionRequirement {
  permissionId: string;
  minRole: string;
}

/**
 * Applet permission requirements
 */
export interface AppletPermissionRequirements {
  [appletId: string]: PermissionRequirement[];
}

/**
 * Generate permission mappings from role hierarchy and minimum role requirements
 *
 * @param roles - Array of roles in hierarchy order (lowest to highest privilege)
 * @param requirements - Object mapping applet IDs to their permission requirements
 * @returns Permission mappings object for RoleConfig
 *
 * @example
 * ```typescript
 * const roles = ["Guest", "Customer", "Staff", "Manager", "Admin", "SuperAdmin"];
 * const requirements = {
 *   "user-management": [
 *     { permissionId: "user-management:view-users", minRole: "Staff" },
 *     { permissionId: "user-management:create-users", minRole: "Manager" },
 *     { permissionId: "user-management:delete-users", minRole: "Admin" }
 *   ]
 * };
 *
 * const permissionMappings = generatePermissionMappings(roles, requirements);
 * // Result:
 * // {
 * //   "user-management": {
 * //     "user-management:view-users": ["Staff", "Manager", "Admin", "SuperAdmin"],
 * //     "user-management:create-users": ["Manager", "Admin", "SuperAdmin"],
 * //     "user-management:delete-users": ["Admin", "SuperAdmin"]
 * //   }
 * // }
 * ```
 */
export function generatePermissionMappings(
  roles: readonly string[],
  requirements: AppletPermissionRequirements,
): Record<string, Record<string, string[]>> {
  const permissionMappings: Record<string, Record<string, string[]>> = {};

  for (const [appletId, permissions] of Object.entries(requirements)) {
    permissionMappings[appletId] = {};

    for (const { permissionId, minRole } of permissions) {
      const minRoleIndex = roles.indexOf(minRole);

      if (minRoleIndex === -1) {
        throw new Error(
          `Role "${minRole}" not found in role hierarchy for permission "${permissionId}"`,
        );
      }

      // Include all roles from minRole and above (higher privilege)
      const allowedRoles = roles.slice(minRoleIndex);
      permissionMappings[appletId][permissionId] = allowedRoles;
    }
  }

  return permissionMappings;
}

/**
 * Creates a type-safe helper to define minimum role requirements for applet permissions
 * @param roles - Array of available roles in the host application
 * @returns A minRole function that provides autocomplete for both permissions and roles
 */
export function createMinRole<R extends readonly string[]>(_roles: R) {
  return function minRole<T extends { permissions: Record<string, PermissionDefinition> }>(
    applet: T,
    permissions: Partial<Record<keyof T['permissions'], R[number]>>
  ): { applet: T; permissions: typeof permissions } {
    return { applet, permissions };
  };
}

/**
 * Helper to create permission requirements from applet objects
 *
 * @example
 * ```typescript
 * const requirements = createPermissionRequirements({
 *   "user-management": {
 *     applet: userManagementApplet,
 *     permissions: {
 *       VIEW_USERS: "Staff",
 *       CREATE_USERS: "Manager",
 *       DELETE_USERS: "Admin"
 *     }
 *   }
 * });
 * ```
 */
export function createPermissionRequirements(
  appletConfigs: Record<
    string,
    {
      applet: any;
      permissions: Record<string, string>;
    }
  >,
): AppletPermissionRequirements {
  const requirements: AppletPermissionRequirements = {};

  for (const [appletId, config] of Object.entries(appletConfigs)) {
    requirements[appletId] = [];

    for (const [permissionKey, minRole] of Object.entries(config.permissions)) {
      const permission = config.applet.permissions[permissionKey];
      if (!permission) {
        throw new Error(
          `Permission "${permissionKey}" not found in applet "${appletId}"`,
        );
      }

      requirements[appletId].push({
        permissionId: permission.id,
        minRole: minRole as string,
      });
    }
  }

  return requirements;
}

// =============================================================================
// PERMISSION UTILITIES
// =============================================================================

/**
 * Convert user roles to a flat list of permissions
 * This bridges the current role system with the new flat permission approach
 * 
 * @param userRoles - Array of user roles
 * @param roleConfig - Role configuration with permission mappings
 * @returns Array of permission IDs the user has access to
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