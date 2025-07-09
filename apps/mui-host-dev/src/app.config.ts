import {
  RoleConfig,
  AppletMount,
  createPermissionRequirements,
  generatePermissionMappings,
  mountApplet,
} from "@smbc/applet-core";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

// Import applets directly from source during development
import userManagementApplet from "../../../applets/user-management/mui/src";
import productCatalogApplet from "../../../applets/product-catalog/mui/src";
import helloApplet from "../../../applets/hello/mui/src";
import demoTasksApplet from "./demo";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const DEMO_USER = {
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
// HOST CONSTANTS
// =============================================================================

export const HOST = {
  drawerWidth: 320,
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
  hello: {
    applet: helloApplet,
    permissions: {
      VIEW_ROUTE_ONE: "Guest",
      VIEW_ROUTE_TWO: "Staff",
      VIEW_ROUTE_THREE: "Manager",
      VIEW_ROUTE_FOUR: "Admin",
    },
  },
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
export const APPLETS: AppletMount[] = [
  // Standard mounting: applet at /user-management
  {
    id: "user-management",
    label: "User Management",
    apiSpec: userManagementApplet.apiSpec,
    apiBaseUrl: `${API_BASE_URL}/user-management`, // Full namespaced URL
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
    apiBaseUrl: `${API_BASE_URL}/user-management`, // Same API as user-management
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
  mountApplet(productCatalogApplet, {
    id: "product-catalog",
    label: "Product Catalog",
    path: "/product-catalog",
    icon: InventoryIcon,
    permissions: [productCatalogApplet.permissions.VIEW_PRODUCTS],
    apiBaseUrl: `${API_BASE_URL}/product-catalog`, // Full namespaced URL
  }),
  mountApplet(helloApplet, {
    id: "hello",
    label: "Hello",
    path: "/hello",
    icon: LanguageIcon,
    permissions: [helloApplet.permissions.VIEW_ROUTE_ONE],
  }),
  mountApplet(demoTasksApplet, {
    id: "demo-tasks",
    label: "Demo Tasks",
    path: "/demo-tasks",
    permissions: [],
  }),
];
