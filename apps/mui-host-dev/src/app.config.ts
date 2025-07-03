import {
  RoleConfig,
  HostAppletDefinition,
  createPermissionRequirements,
  generatePermissionMappings,
} from "@smbc/applet-core";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

// Import applets directly from source during development
import userManagementApplet from "../../../applets/user-management/mui/src";
import productCatalogApplet from "../../../applets/product-catalog/mui/src";
import demoTasksApplet from "./demo";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "staff@smbc.com",
  name: "Demo Staff",
  roles: ["Admin"],
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
  appName: "SMBC Applet Host",
} as const;

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

// Define minimum required roles for each permission
const permissionRequirements = createPermissionRequirements({
  "user-management": {
    applet: userManagementApplet,
    permissions: {
      VIEW_USERS: "Staff",
      CREATE_USERS: "Manager",
      EDIT_USERS: "Manager",
      DELETE_USERS: "Admin",
      MANAGE_ROLES: "Admin",
      VIEW_ANALYTICS: "Manager",
    },
  },
  "admin-users": {
    applet: userManagementApplet,
    permissions: {
      VIEW_USERS: "Admin",
      CREATE_USERS: "Admin",
      EDIT_USERS: "Admin",
      DELETE_USERS: "SuperAdmin",
      MANAGE_ROLES: "Admin",
      VIEW_ANALYTICS: "Admin",
    },
  },
  "product-catalog": {
    applet: productCatalogApplet,
    permissions: {
      VIEW_PRODUCTS: "Guest",
      CREATE_PRODUCTS: "Staff",
      EDIT_PRODUCTS: "Staff",
      DELETE_PRODUCTS: "Manager",
      MANAGE_CATEGORIES: "Manager",
      VIEW_INVENTORY: "Staff",
      MANAGE_PRICING: "Manager",
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
// FLAT PERMISSION SYSTEM (New approach)
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

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

// multiple instances can be mounted at different paths
const NonAdminUsers = () =>
  userManagementApplet.component({
    mountPath: "/user-management",
    userType: "non-admins",
  });

const AdminUsers = () =>
  userManagementApplet.component({
    mountPath: "/admin/users",
    userType: "admins",
    permissionContext: "admin-users",
  });

// All applets configured for this host
export const APPLETS: HostAppletDefinition[] = [
  // Standard mounting: applet at /user-management
  {
    id: "user-management",
    label: "User Management",
    apiSpec: userManagementApplet.apiSpec,
    routes: [
      {
        path: "/user-management",
        label: "User Management",
        component: NonAdminUsers,
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
    apiSpec: userManagementApplet.apiSpec,
    routes: [
      {
        path: "/admin/users",
        label: "Admin Users",
        component: AdminUsers,
        icon: PeopleIcon,
        requiredPermissions: [userManagementApplet.permissions.MANAGE_ROLES.id],
      },
    ],
  },
  {
    id: "product-catalog",
    label: "Product Catalog",
    apiSpec: productCatalogApplet.apiSpec,
    routes: productCatalogApplet.routes.map((route: any) => ({
      ...route,
      path: "/product-catalog",
      icon: InventoryIcon,
      requiredPermissions: [productCatalogApplet.permissions.VIEW_PRODUCTS.id],
    })),
  },
  demoTasksApplet,
];
