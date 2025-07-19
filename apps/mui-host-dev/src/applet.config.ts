import {
  RoleConfig,
  AppletMount,
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
} from "@smbc/applet-core";
import { mountApplet } from "@smbc/applet-host";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Language as LanguageIcon,
  Badge as BadgeIcon,
  Analytics as AnalyticsIcon,
  Task as TaskIcon,
} from "@mui/icons-material";

// Import applets directly from source during development
import userManagementApplet from "../../../applets/user-management/mui/src";
import productCatalogApplet from "../../../applets/product-catalog/mui/src";
import helloApplet from "../../../applets/hello/mui/src";
import employeeDirectoryApplet from "../../../applets/employee-directory/mui/src";
import usageStatsApplet from "../../../applets/usage-stats/mui/src";
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

const minRole = createMinRole(HOST_ROLES);

// Define minimum required roles for each permission
const permissionRequirements = createPermissionRequirements({
  "user-management": minRole(userManagementApplet, {
    VIEW_USERS: "Staff",
    CREATE_USERS: "Manager",
    EDIT_USERS: "Manager",
    DELETE_USERS: "Admin",
    MANAGE_ROLES: "Admin",
    VIEW_ANALYTICS: "Manager",
  }),
  "admin-users": minRole(userManagementApplet, {
    VIEW_USERS: "Admin",
    CREATE_USERS: "Admin",
    EDIT_USERS: "Admin",
    DELETE_USERS: "SuperAdmin",
    MANAGE_ROLES: "Admin",
    VIEW_ANALYTICS: "Admin",
  }),
  "product-catalog": minRole(productCatalogApplet, {
    VIEW_PRODUCTS: "Guest",
    CREATE_PRODUCTS: "Staff",
    EDIT_PRODUCTS: "Staff",
    DELETE_PRODUCTS: "Manager",
    MANAGE_CATEGORIES: "Manager",
    VIEW_INVENTORY: "Staff",
    MANAGE_PRICING: "Manager",
  }),
  hello: minRole(helloApplet, {
    VIEW_ROUTE_ONE: "Guest",
    VIEW_ROUTE_TWO: "Staff",
    VIEW_ROUTE_THREE: "Manager",
    VIEW_ROUTE_FOUR: "Admin",
  }),
  "employee-directory": minRole(employeeDirectoryApplet, {
    VIEW_EMPLOYEES: "Staff",
    EDIT_EMPLOYEES: "Manager",
    MANAGE_EMPLOYEES: "Admin",
  }),
  "usage-stats": minRole(usageStatsApplet, {
    VIEW_USAGE_STATS: "Manager",
    VIEW_USER_USAGE: "Manager",
    VIEW_COMPONENT_USAGE: "Staff",
    VIEW_EXCEPTIONS: "Manager",
    EXPORT_USAGE_DATA: "Admin",
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

// Static applets configuration
export const APPLETS: AppletMount[] = [
  // Applet Guide
  mountApplet(helloApplet, {
    id: "hello",
    label: "Applet Guide",
    path: "/hello",
    icon: LanguageIcon,
    permissions: [helloApplet.permissions.VIEW_ROUTE_ONE],
    version: "1.0.0",
    filterable: false,
  }),

  // Standard mounting: applet at /user-management
  {
    id: "user-management",
    label: "User Management",
    apiSpec: userManagementApplet.apiSpec,
    version: "1.0.0",
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
    version: "1.0.0",
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
    version: "1.0.0",
  }),
  mountApplet(employeeDirectoryApplet, {
    id: "employee-directory",
    label: "Employee Directory",
    path: "/employees",
    icon: BadgeIcon,
    permissions: [employeeDirectoryApplet.permissions.VIEW_EMPLOYEES],
    version: "1.0.0",
  }),
  mountApplet(
    usageStatsApplet,
    {
      id: "usage-stats",
      label: "Usage Analytics",
      path: "/usage-stats",
      icon: AnalyticsIcon,
      permissions: [usageStatsApplet.permissions.VIEW_USAGE_STATS],
      version: "1.0.0",
    },
    [{ url: "http://localhost:8003/api/v1", description: "dev" }],
  ),
  mountApplet(demoTasksApplet, {
    id: "demo-tasks",
    label: "Demo Tasks",
    path: "/demo-tasks",
    icon: TaskIcon,
    permissions: [],
    version: "0.0.0",
  }),
];
