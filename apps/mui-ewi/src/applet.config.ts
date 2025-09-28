import {
  RoleConfig,
  AppletMount,
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
} from "@smbc/applet-core";
import { mountApplet, createApiOverrides } from "@smbc/applet-host";
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
    EDIT_OWN_EVENTS: "Staff",
    EDIT_ALL_EVENTS: "Manager",
  }),
  "ewi-event-details": minRole(ewiEventDetailsApplet, {
    VIEW_EVENT_DETAILS: "Analyst",
  }),
  "ewi-obligor": minRole(ewiObligorApplet, {
    VIEW_OBLIGORS: "Analyst",
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
const apiOverrides = createApiOverrides([
  {
    pattern: "*/api/*",
    envVar: "VITE_API_BASE",
  },
]);

// Applet definitions
const appletDefinitions = [
  {
    applet: ewiEventsApplet,
    config: {
      id: "ewi-events",
      label: "Events",
      path: "/events",
      icon: Dashboard,
      permissions: [ewiEventsApplet.permissions.VIEW_EVENTS],
    },
  },
  {
    applet: ewiEventDetailsApplet,
    config: {
      id: "ewi-event-details",
      label: "Event Details",
      path: "/events/detail",
      icon: Dashboard,
      permissions: [ewiEventDetailsApplet.permissions.VIEW_EVENT_DETAILS],
    },
  },
  {
    applet: ewiObligorApplet,
    config: {
      id: "ewi-obligor",
      label: "Obligor Dashboard",
      path: "/obligor-dashboard",
      icon: Dashboard,
      permissions: [ewiObligorApplet.permissions.VIEW_OBLIGORS],
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
