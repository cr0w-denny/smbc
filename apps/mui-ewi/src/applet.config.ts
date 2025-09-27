import {
  RoleConfig,
  AppletMount,
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
} from "@smbc/applet-core";
import { mountApplet, createapiOverrides } from "@smbc/applet-host";
import { BarChart, Dashboard } from "@smbc/mui-components";

import ewiEventsApplet from "@smbc/ewi-events-mui";
import ewiEventDetailsApplet from "@smbc/ewi-event-details-mui";
import ewiObligorApplet from "@smbc/ewi-obligor-mui";
import usageStatsApplet from "@smbc/usage-stats-mui";

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

// Configure api override mappings
const apiOverrides = createapiOverrides([
  {
    pattern: "*/api/*",
    envVar: "VITE_API_BASE",
  },
]);

// Applet definitions
const appletDefinitions = [
  {
    applet: ewiEventDetailsApplet,
    config: {
      id: "ewi-event-details",
      label: "Event Details",
      path: "/events/detail",
      icon: Dashboard,
      permissions: [],
    },
  },
  {
    applet: ewiEventsApplet,
    config: {
      id: "ewi-events",
      label: "EWI Events",
      path: "/events",
      icon: Dashboard,
      permissions: [ewiEventsApplet.permissions.VIEW_EVENTS],
    },
  },
  {
    applet: ewiObligorApplet,
    config: {
      id: "ewi-obligor",
      label: "Obligor Dashboard",
      path: "/obligor-dashboard",
      icon: Dashboard,
      permissions: [],
    },
  },
  {
    applet: usageStatsApplet,
    config: {
      id: "usage-stats",
      label: "Usage Stats",
      path: "/usage-stats",
      icon: BarChart,
      permissions: [],
    },
  },
];

export const APPLETS: AppletMount[] = appletDefinitions.map((def) =>
  mountApplet(
    def.applet,
    def.config,
    apiOverrides((def.applet as any).apiSpec?.spec?.servers || []),
  ),
);
