// Permission mapping generator utilities

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
  requirements: AppletPermissionRequirements
): Record<string, Record<string, string[]>> {
  const permissionMappings: Record<string, Record<string, string[]>> = {};

  for (const [appletId, permissions] of Object.entries(requirements)) {
    permissionMappings[appletId] = {};

    for (const { permissionId, minRole } of permissions) {
      const minRoleIndex = roles.indexOf(minRole);
      
      if (minRoleIndex === -1) {
        throw new Error(`Role "${minRole}" not found in role hierarchy for permission "${permissionId}"`);
      }

      // Include all roles from minRole and above (higher privilege)
      const allowedRoles = roles.slice(minRoleIndex);
      permissionMappings[appletId][permissionId] = allowedRoles;
    }
  }

  return permissionMappings;
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
  appletConfigs: Record<string, {
    applet: any;
    permissions: Record<string, string>;
  }>
): AppletPermissionRequirements {
  const requirements: AppletPermissionRequirements = {};

  for (const [appletId, config] of Object.entries(appletConfigs)) {
    requirements[appletId] = [];

    for (const [permissionKey, minRole] of Object.entries(config.permissions)) {
      const permission = config.applet.permissions[permissionKey];
      if (!permission) {
        throw new Error(`Permission "${permissionKey}" not found in applet "${appletId}"`);
      }

      requirements[appletId].push({
        permissionId: permission.id,
        minRole
      });
    }
  }

  return requirements;
}