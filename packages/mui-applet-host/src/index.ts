// =============================================================================
// SMBC MUI Host - Main Entry Point
// =============================================================================

// Re-export core applet functionality
export {
  AppProvider,
  useApp,
  useUser,
  useHashNavigation,
  useAppletPermissions,
  usePersistedRoles,
  useRoleManagement,
  usePermissionFilteredRoutes,
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagToggle,
  AppletRouter,
} from "@smbc/mui-applet-core";

// Re-export pure MUI components
export {
  HostAppBar,
  AppletDrawer,
  NotificationMenu,
  ApiDocsModal,
  lightTheme,
  darkTheme,
} from "@smbc/mui-components";

// Re-export MUI applet features
export {
  RoleManagementFeature as RolePermissionDashboard,
  AutoFilter,
  AutoFilterFromOperation,
  AutoFilterFromFields,
  useAutoFilterFromOperation,
  useAutoFilterFromFields,
  filterFieldPresets,
  createFilterField,
  useAutoFilterWithUrlFromOperation,
  useAutoFilterWithUrlFromFields,
  useUrlFilters,
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
  // App Shell components
  AppShell,
  TopNavShell,
  NavigationDrawer,
  UserMenu,
} from "@smbc/mui-applet-features";

// Re-export types
export type { NavigationRoute } from "@smbc/mui-components";

export type {
  PermissionGroup,
  Permission,
  User,
  AutoFilterConfig,
  OpenAPIParameter,
  UseAutoFilterParams,
} from "@smbc/mui-applet-features";

// Re-export query client utilities
export {
  SMBCQueryProvider,
  registerMswHandlers,
} from "@smbc/shared-query-client";

// Export main host APIs
export * from "./createApp";
export * from "./AppletProvider";
export * from "./AppletRoute";
export * from "./types";
export * from "./config";
export * from "./utils";
