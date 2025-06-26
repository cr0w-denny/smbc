// Consolidated App Configuration

import { ComponentType } from "react";
import { RoleConfig } from "@smbc/mui-applet-core";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

// Import applets directly
import userManagementApplet from "@smbc/user-management-mui";
import productCatalogApplet from "@smbc/product-catalog-mui";

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = [
  "Guest",
  "Customer",
  "Staff",
  "Manager",
  "Admin",
  "SuperAdmin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

export const roleConfig: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: {
    "user-management": {
      [userManagementApplet.permissions.VIEW_USERS.id]: [
        "Staff",
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.CREATE_USERS.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.EDIT_USERS.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.DELETE_USERS.id]: [
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.MANAGE_ROLES.id]: [
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.VIEW_ANALYTICS.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
    },
    "admin-users": {
      [userManagementApplet.permissions.VIEW_USERS.id]: ["Admin", "SuperAdmin"],
      [userManagementApplet.permissions.CREATE_USERS.id]: [
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.EDIT_USERS.id]: ["Admin", "SuperAdmin"],
      [userManagementApplet.permissions.DELETE_USERS.id]: ["SuperAdmin"],
      [userManagementApplet.permissions.MANAGE_ROLES.id]: [
        "Admin",
        "SuperAdmin",
      ],
      [userManagementApplet.permissions.VIEW_ANALYTICS.id]: [
        "Admin",
        "SuperAdmin",
      ],
    },
    "product-catalog": {
      [productCatalogApplet.permissions.VIEW_PRODUCTS.id]: [
        "Guest",
        "Customer",
        "Staff",
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.CREATE_PRODUCTS.id]: [
        "Staff",
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.EDIT_PRODUCTS.id]: [
        "Staff",
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.DELETE_PRODUCTS.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.MANAGE_CATEGORIES.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.VIEW_INVENTORY.id]: [
        "Staff",
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
      [productCatalogApplet.permissions.MANAGE_PRICING.id]: [
        "Manager",
        "Admin",
        "SuperAdmin",
      ],
    },
  },
};

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

export interface HostAppletRoute {
  path: string;
  label: string;
  component: ComponentType;
  icon?: ComponentType;
  requiredPermissions?: string[];
}

export interface HostAppletDefinition {
  id: string;
  label: string;
  routes: HostAppletRoute[];
}

// All applets configured for this host
export const APPLETS: HostAppletDefinition[] = [
  // Standard mounting: applet at /user-management
  {
    id: "user-management",
    label: "User Management",
    routes: [
      {
        path: "/user-management",
        label: "User Management",
        component: () =>
          userManagementApplet.component({
            mountPath: "/user-management",
            userType: "non-admins",
          }),
        icon: PeopleIcon,
        requiredPermissions: [userManagementApplet.permissions.VIEW_USERS.id],
      },
    ],
  },

  // Custom mounting example: Same applet at different path with stricter permissions
  // This demonstrates how you can mount the same applet multiple times
  // URLs will be: /admin/users, /admin/users/profile
  {
    id: "admin-users",
    label: "Admin Users",
    routes: [
      {
        path: "/admin/users",
        label: "Admin Users",
        component: () =>
          userManagementApplet.component({
            mountPath: "/admin/users",
            userType: "admins",
            permissionContext: "admin-users",
          }),
        icon: PeopleIcon,
        requiredPermissions: [userManagementApplet.permissions.MANAGE_ROLES.id],
      },
    ],
  },
  {
    id: "product-catalog",
    label: "Product Catalog",
    routes: productCatalogApplet.routes.map((route: any) => ({
      ...route,
      path: "/product-catalog" + (route.path === "/" ? "" : route.path),
      icon: InventoryIcon,
      requiredPermissions: [productCatalogApplet.permissions.VIEW_PRODUCTS.id],
    })),
  },
];

// Helper function to get all routes from all applets
export function getAllRoutes(): HostAppletRoute[] {
  const appletRoutes = APPLETS.flatMap((applet) => applet.routes);
  return appletRoutes;
}

// Helper function to get the original applets (for API documentation)
export const applets = [userManagementApplet, productCatalogApplet];

// Helper function to get the current applet based on path
export function getCurrentApplet(path: string) {
  // Check if path matches any applet
  for (const hostApplet of APPLETS) {
    if (path.startsWith("/" + hostApplet.id)) {
      // Map host applet ID to original applet
      let originalApplet;
      if (
        hostApplet.id === "user-management" ||
        hostApplet.id === "admin-users"
      ) {
        originalApplet = userManagementApplet;
      } else if (hostApplet.id === "product-catalog") {
        originalApplet = productCatalogApplet;
      }

      if (originalApplet) {
        return {
          hostApplet,
          originalApplet,
        };
      }
    }
  }
  return null;
}

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "staff@smbc.com",
  name: "Demo Staff",
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
// APP CONSTANTS
// =============================================================================

export const APP_CONSTANTS = {
  drawerWidth: 240,
  appName: "SMBC Management System",
  version: "1.0.1",
} as const;
