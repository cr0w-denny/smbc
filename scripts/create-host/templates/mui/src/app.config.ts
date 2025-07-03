import {
  RoleConfig,
  HostAppletDefinition,
  createPermissionRequirements,
  generatePermissionMappings,
} from "@smbc/applet-core";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@{{HOST_NAME}}.com",
  name: "Demo User",
  roles: ["User"],
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
};

// =============================================================================
// APP CONSTANTS
// =============================================================================

export const APP_CONSTANTS = {
  appName: "{{HOST_DISPLAY_NAME}}",
} as const;

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = ["User", "Admin"] as const;

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

// Add your applets here following this pattern:
// import yourApplet from "path/to/your/applet";
//
// export const appletDefinitions: Record<string, HostAppletDefinition> = {
//   "your-applet": {
//     applet: yourApplet,
//     permissions: {
//       VIEW: "User",
//       EDIT: "Admin",
//     },
//   },
// };

export const appletDefinitions: Record<string, HostAppletDefinition> = {};

// =============================================================================
// PERMISSION REQUIREMENTS
// =============================================================================

export const permissionRequirements = createPermissionRequirements(
  HOST_ROLES,
  appletDefinitions,
);

// Auto-generate the verbose permission mappings
export const roleConfig: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

// =============================================================================
// FLAT PERMISSION SYSTEM
// =============================================================================

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
  Object.entries(roleConfig.permissionMappings || {}).forEach(([appletId, appletPermissions]) => {
    Object.entries(appletPermissions).forEach(([permissionId, requiredRoles]) => {
      // Check if user has any of the required roles for this permission
      const hasPermission = userRoles.some(userRole => 
        requiredRoles.includes(userRole)
      );
      
      if (hasPermission) {
        permissions.push(`${appletId}:${permissionId}`);
      }
    });
  });
  
  return permissions;
}