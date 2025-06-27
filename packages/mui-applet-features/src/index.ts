// Role Management Feature
export {
  RoleManagementFeature,
  useLocalStoragePersistence,
} from "./RoleManagement";

export type {
  RoleManagementFeatureProps,
  User,
  Permission,
  PermissionGroup,
} from "./RoleManagement";

// AutoFilter Feature
export {
  AutoFilter,
  AutoFilterFromOperation,
  AutoFilterFromFields,
} from "./AutoFilter";

export {
  useAutoFilterFromOperation,
  useAutoFilterFromFields,
  filterFieldPresets,
  createFilterField,
} from "./AutoFilter";

export {
  useAutoFilterWithUrlFromOperation,
  useAutoFilterWithUrlFromFields,
  useUrlFilters,
} from "./AutoFilter";

export {
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
} from "./AutoFilter";

// AutoFilter types
export type {
  AutoFilterConfig,
  OpenAPIParameter,
  UseAutoFilterParams,
} from "./AutoFilter";

// App Shell Feature (stateful components)
export {
  ConnectedAppShell,
  AppShellProvider,
  useAppShell,
} from "./AppShell";

export type {
  AppShellConfig,
  UserAction,
  NotificationAction,
  AppShellFeatureProps,
} from "./AppShell";

// Navigation Feature (stateful components)
export {
  NavigationProvider,
  useNavigationContext,
  ConnectedNavigationDrawer,
} from "./Navigation";

export type {
  NavigationItemData as AppletNavigationItemData,
  NavigationProviderProps,
  NavigationContextValue,
} from "./Navigation";
