import {
  RoleConfig,
  AppletMount,
  generatePermissionMappings,
  createPermissionRequirements,
  mountApplet,
} from "@smbc/applet-core";
import {
  People as PeopleIcon
} from "@mui/icons-material";

// Import applets
import usermanagementApplet from "@smbc/user-management-mui";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@my.com",
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
  appName: "My",
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
    "user-management": {
    applet: usermanagementApplet,
    permissions: {
      VIEW_USERS: "User",
      CREATE_USERS: "User",
      EDIT_USERS: "User",
      DELETE_USERS: "User",
      MANAGE_ROLES: "User"
    },
  }
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
  mountApplet(usermanagementApplet, {
    id: "user-management",
    label: "User Management",
    path: "/user-management",
    icon: PeopleIcon,
    permissions: [usermanagementApplet.permissions.VIEW_USERS],
  })
];