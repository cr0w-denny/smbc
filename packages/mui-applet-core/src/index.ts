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

export { ActionBar } from "./ActionBar";
export { ActivityNotifications } from "./ActivityNotifications";
export { ActivitySnackbar } from "./ActivitySnackbar";

// Re-export MuiDataView from the separate package for convenience
export { MuiDataView } from "@smbc/react-query-dataview-mui";


