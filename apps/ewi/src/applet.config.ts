import {
  RoleConfig,
  AppletMount,
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
} from "@smbc/applet-core";
import { mountApplet } from "@smbc/applet-host";
import type { AppShellMenuStructure } from "@smbc/mui-applet-core";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

// Import applet directly from source during development
import ewiEventsApplet from "../../../applets/ewi-events/mui/src";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const DEMO_USER = {
  id: "1",
  email: "staff@ewi.com",
  name: "EWI Staff",
  roles: ["Staff"],
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
  drawerWidth: 320,
  appName: "EWI Dashboard",
} as const;

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = [
  "Guest",
  "Analyst",
  "Staff",
  "Manager",
  "Admin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

const minRole = createMinRole(HOST_ROLES);

// Define minimum required roles for each permission
const permissionRequirements = createPermissionRequirements({
  "ewi-events": minRole(ewiEventsApplet, {
    VIEW_EVENTS: "Analyst",
  }),
});

// Auto-generate the verbose permission mappings
export const ROLE_CONFIG: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

export const APPLETS: AppletMount[] = [
  mountApplet(ewiEventsApplet, {
    id: "ewi-events",
    label: "EWI Events",
    path: "/ewi-events",
    icon: DashboardIcon,
    permissions: [ewiEventsApplet.permissions.VIEW_EVENTS],
    apiBaseUrl: "/api/v1/ewi-events", // Force mock environment URL
  }),
];

// =============================================================================
// MENU STRUCTURE
// =============================================================================

export const MENUS: AppShellMenuStructure = {
  menus: [
    {
      label: "Events",
      children: [
        { label: "Events Dashboard", applet: "ewi-events" },
        { label: "Obligor Dashboard", applet: "obligor-management" },
      ],
    },
    {
      label: "Reports",
      children: [
        { label: "Monthly Reports", applet: "monthly-reports" },
        { label: "Annual Reports", applet: "annual-reports" },
      ],
    },
    {
      label: "Management",
      children: [{ label: "Settings", applet: "settings" }],
    },
  ],
  staticItems: [{ label: "Help", type: "button", color: "primary" }],
};
