


// DataView
export { MuiDataViewApplet } from "./DataView/DataViewApplet";

export type {
  MuiDataViewAppletConfig,
  MuiDataViewAppletProps,
} from "./DataView/DataViewApplet";

export { ActionBar } from "./ActionBar";
export { ActivityNotifications } from "./ActivityNotifications";
export { ActivitySnackbar } from "./ActivitySnackbar";
export { AppletPage } from "./AppletPage";

// AppShell Menu Builder
export { buildAppShellNavigation } from "./AppShellMenuBuilder";
export type { 
  AppletMenuItem,
  TopLevelMenu,
  AppShellMenuStructure,
  BuildNavigationOptions,
} from "./AppShellMenuBuilder";

// Re-export MUI components from the separate package for convenience
export { MuiDataView, MuiDataViewManager } from "@smbc/dataview-mui";
export type { 
  MuiDataViewManagerConfig,
  MuiDataViewManagerProps,
} from "@smbc/dataview-mui";


