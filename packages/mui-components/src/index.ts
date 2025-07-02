// Export all shared MUI components
export { LoadingTable } from "./LoadingTable";
export type { LoadingTableProps } from "./LoadingTable";

export { ConfirmationDialog } from "./ConfirmationDialog";
export type { ConfirmationDialogProps } from "./ConfirmationDialog";

// Keep TransactionProgressOverlay component for future advanced progress features
// export { TransactionProgressOverlay } from "./TransactionProgressOverlay";
// export type { TransactionProgressOverlayProps } from "./TransactionProgressOverlay";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { ApiDocsModal } from "./ApiDocsModal";
export type { ApiDocsModalProps } from "./ApiDocsModal";

export {
  DashboardHeader,
  CurrentUserInfo,
  PermissionChip,
  PermissionCard,
  PermissionsGrid,
} from "./RoleManagement";

export type { User, Permission, PermissionGroup } from "./RoleManagement";

export { DevHostAppBar } from "./DevHostAppBar";
export type { DevHostAppBarProps, CurrentAppletInfo } from "./DevHostAppBar";

export { AppletDrawer, AppletNavigation } from "./AppletDrawer";
export type {
  AppletDrawerProps,
  AppletNavigationProps,
  NavigationRoute,
} from "./AppletDrawer";

// Filter components and types
export {
  Filter,
  FilterField,
  FilterFieldGroup,
  FilterContainer,
} from "./Filter";

export type {
  FilterFieldConfig,
  FilterValues,
  FilterSpec,
  FilterProps,
} from "./Filter";

// Navigation components and types (pure UI)
export { NavigationDrawer, NavigationList, NavigationItem } from "./Navigation";

export type {
  NavigationItemData,
  NavigationItemProps,
  NavigationListProps,
  NavigationDrawerProps,
} from "./Navigation";

export { AppShell, AppToolbar, AppMainContent } from "./AppShell";

export type {
  AppShellProps,
  AppToolbarProps,
  AppMainContentProps,
} from "./AppShell";

export { lightTheme } from "./theme/light";
export { darkTheme } from "./theme/dark";
import { lightTheme } from "./theme/light";
import { darkTheme } from "./theme/dark";
export const getTheme = (mode: "light" | "dark" = "light") => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "light":
    default:
      return lightTheme;
  }
};

// DataView renderer for MUI
export { MuiDataView } from "./MuiDataView";

// Action bar component
export { ActionBar } from "./ActionBar";
export type { ActionBarProps } from "./ActionBar";

// Activity notifications component
export { ActivityNotifications } from "./ActivityNotifications";
export type { ActivityNotificationsProps } from "./ActivityNotifications";

// Activity snackbar component
export { ActivitySnackbar } from "./ActivitySnackbar";
export type { ActivitySnackbarProps } from "./ActivitySnackbar";
