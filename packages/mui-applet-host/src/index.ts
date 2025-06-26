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
} from '@smbc/mui-applet-core';

// Re-export MUI components for host apps
export {
  HostAppBar,
  AppletDrawer,
  AppShell,
  TopNavShell,
  NavigationDrawer,
  UserMenu,
  NotificationMenu,
  ApiDocsModal,
  RolePermissionDashboard,
  lightTheme,
  darkTheme,
} from '@smbc/mui-components';

// Re-export types
export type { 
  NavigationRoute,
  AppletPermissionGroup,
  Permission,
  User
} from '@smbc/mui-components';

// Re-export query client utilities
export {
  SMBCQueryProvider,
  registerMswHandlers,
} from '@smbc/shared-query-client';

// Export main host APIs
export * from './createApp';
export * from './AppletProvider';
export * from './AppletRoute';
export * from './types';
export * from './config';
export * from './utils';