// Role Management
export { RoleManagement, useLocalStoragePersistence } from "./RoleManagement";

export type {
  RoleManagementProps,
  User,
  Permission,
  PermissionGroup,
} from "./RoleManagement";

// AutoFilter
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

// AutoFilter types
export type {
  AutoFilterConfig,
  OpenAPIParameter,
  UseAutoFilterParams,
} from "./AutoFilter";

// App Shell
export { ConnectedAppShell, AppShellProvider, useAppShell } from "./AppShell";

export type {
  AppShellConfig,
  UserAction,
  NotificationAction,
  AppShellFeatureProps,
} from "./AppShell";

// Navigation
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

// DataView
export { MuiDataViewApplet } from "./DataView/DataViewApplet";

export type {
  MuiDataViewAppletConfig,
  MuiDataViewAppletProps,
} from "./DataView/DataViewApplet";

// Components moved from mui-components
export { ActionBar } from "./ActionBar";
export { ActivityNotifications } from "./ActivityNotifications";
export { ActivitySnackbar } from "./ActivitySnackbar";

// Internal components exported for Storybook only
// @internal - Do not use directly, use MuiDataViewApplet instead
export { MuiDataView } from "./DataView/MuiDataView";
