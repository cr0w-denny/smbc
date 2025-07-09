import {
  RoleConfig,
  AppletMount,
  generatePermissionMappings,
  createPermissionRequirements,
  mountApplet,
} from "@smbc/applet-core";
import {
  People as PeopleIcon,
  EmojiEmotions as EmojiEmotionsIcon,
} from "@mui/icons-material";
import { QueryClient } from "@tanstack/react-query";

// Import applets
import usermanagementApplet from "@smbc/user-management-mui";
import helloApplet from "@smbc/hello-mui";

// =============================================================================
// DEVELOPMENT FEATURES
// =============================================================================

export const DEV_FEATURES =
  process.env.NODE_ENV === "development"
    ? ({
        apiDocs: true,
        mockControls: true,
        appletClickToCopy: false,
      } as const)
    : ({
        apiDocs: false,
        mockControls: false,
        appletClickToCopy: false,
      } as const);

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
// HOST CONSTANTS
// =============================================================================

export const HOST = {
  drawerWidth: 240,
  appName: "My Host",
} as const;

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = ["Guest", "User", "Admin"] as const;

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
      MANAGE_ROLES: "User",
    },
  },
  hello: {
    applet: helloApplet,
    permissions: {
      VIEW_ROUTE_ONE: "User",
      VIEW_ROUTE_TWO: "User",
      VIEW_ROUTE_THREE: "User",
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
// FEATURE FLAGS CONFIGURATION
// =============================================================================

export const featureFlags = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "mockData",
    defaultValue: true,
    description: "Use mock data instead of real API endpoints",
    persist: true,
  },
];

// =============================================================================
// QUERY CLIENT CONFIGURATION
// =============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
    },
  },
});

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
  }),
  mountApplet(helloApplet, {
    id: "hello",
    label: "Hello World",
    path: "/hello",
    icon: EmojiEmotionsIcon,
    permissions: [helloApplet.permissions.VIEW_ROUTE_ONE],
  }),
];
