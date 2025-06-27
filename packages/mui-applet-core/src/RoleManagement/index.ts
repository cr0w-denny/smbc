// Main feature component
export { RoleManagement } from "./RoleManagement";
export type { RoleManagementProps } from "./RoleManagement";

// Hooks re-exported from applet-core
export { useLocalStoragePersistence } from "@smbc/applet-core";

// Re-export related types from mui-components for convenience
export type { User, Permission, PermissionGroup } from "@smbc/mui-components";
