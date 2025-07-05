import {
  RoleConfig,
  createPermissionRequirements,
  generatePermissionMappings,
  mountApplets,
} from "@smbc/applet-core";
import {
  People as PeopleIcon,
  EmojiEmotions as EmojiEmotionsIcon,
} from "@mui/icons-material";

// Import applets
import usermanagementApplet from "@smbc/user-management-mui";
import helloApplet from "@smbc/hello-mui";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@my-host.com",
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
  appName: "My Host",
  drawerWidth: 320,
} as const;

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = ["Guest", "User", "Staff", "Admin"] as const;

// =============================================================================
// APPLET CONFIGURATION
// =============================================================================

// TODO: Customize permission-to-role mappings below based on your host's roles
// By default, all applet permissions are mapped to "User" role
const { permissionRequirements, mountedApplets } = mountApplets({
  "user-management": {
    applet: usermanagementApplet,
    label: "User Management",
    path: "/user-management",
    icon: PeopleIcon,
    permissions: {
      VIEW_USERS: "Guest",
      CREATE_USERS: "Admin",
      EDIT_USERS: "Admin",
      DELETE_USERS: "Admin",
      MANAGE_ROLES: "Admin",
    },
  },
  hello: {
    applet: helloApplet,
    label: "Hello World",
    path: "/hello",
    icon: EmojiEmotionsIcon,
    permissions: {
      VIEW_ROUTE_ONE: "Guest",
      VIEW_ROUTE_TWO: "User",
      VIEW_ROUTE_THREE: "Staff",
    },
  },
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
