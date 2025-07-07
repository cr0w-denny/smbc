import {
  RoleConfig,
  AppletMount,
  generatePermissionMappings,
  createPermissionRequirements,
  mountApplet,
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
// HOST CONSTANTS
// =============================================================================

export const HOST = {
  drawerWidth: 240,
  appName: "{{HOST_DISPLAY_NAME}}",
} as const;

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = [
  "Guest",
  "User",
  "Admin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

// Define minimum required roles for each permission
const permissionRequirements = createPermissionRequirements({
  {{APPLET_CONFIGS}}
});

// Auto-generate the verbose permission mappings
export const roleConfig: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

// All applets configured for this host
export const APPLETS: AppletMount[] = [
{{MOUNTED_APPLETS}}
];