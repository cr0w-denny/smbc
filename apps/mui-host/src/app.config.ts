import {
  RoleConfig,
  AppletMount,
  generatePermissionMappings,
  createPermissionRequirements,
  mountApplet,
} from "@smbc/applet-core";
import { Language as LanguageIcon } from "@mui/icons-material";

// Import hello applet
import helloApplet from "@smbc/hello-mui";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@company.com",
  name: "Production User",
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
  appName: "SMBC Applet Host",
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
  hello: {
    applet: helloApplet,
    permissions: {
      VIEW_ROUTE_ONE: "Guest",
      VIEW_ROUTE_TWO: "User",
      VIEW_ROUTE_THREE: "Admin",
    },
  },
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
  mountApplet(helloApplet, {
    id: "hello",
    label: "Hello",
    path: "/hello",
    icon: LanguageIcon,
    permissions: [helloApplet.permissions.VIEW_ROUTE_ONE],
  }),
];