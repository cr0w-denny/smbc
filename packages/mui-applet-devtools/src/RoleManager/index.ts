// Main feature component
export { RoleManager } from "./RoleManager";
export type { RoleManagerProps } from "./RoleManager";

// Individual components
export { DashboardHeader } from "./DashboardHeader";
export { CurrentUserInfo } from "./CurrentUserInfo";
export { PermissionChip } from "./PermissionChip";
export { PermissionCard } from "./PermissionCard";
export { PermissionsGrid } from "./PermissionsGrid";

// Types
export type { User, Permission, PermissionGroup } from "./types";

// Hooks re-exported from applet-core
export { useLocalStoragePersistence } from "@smbc/applet-core";
