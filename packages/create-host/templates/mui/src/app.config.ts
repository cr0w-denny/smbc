import {
  RoleConfig,
  createPermissionRequirements,
  generatePermissionMappings,
  mountApplets,
} from "@smbc/applet-core";
{{ICON_IMPORTS}}

// Import applets
{{APPLET_IMPORTS}}

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
// APPLET CONFIGURATION
// =============================================================================

// TODO: Customize permission-to-role mappings below based on your host's roles
// By default, all applet permissions are mapped to "User" role
const { permissionRequirements, mountedApplets } = mountApplets({
{{APPLET_CONFIGS}}
});

export const APPLETS = mountedApplets;

// Auto-generate the verbose permission mappings
export const roleConfig: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    createPermissionRequirements(permissionRequirements),
  ),
};

