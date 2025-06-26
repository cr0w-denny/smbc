// Export all shared MUI components
export { LoadingTable } from "./LoadingTable";
export type { LoadingTableProps } from "./LoadingTable";

export { ConfirmationDialog } from "./ConfirmationDialog";
export type { ConfirmationDialogProps } from "./ConfirmationDialog";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { ApiDocsModal } from "./ApiDocsModal";
export type { ApiDocsModalProps } from "./ApiDocsModal";

// Pure UI components for role management
export {
  DashboardHeader,
  CurrentUserInfo,
  PermissionChip,
  PermissionCard,
  PermissionsGrid,
} from "./RolePermissionDashboard";

export type {
  User,
  Permission,
  PermissionGroup,
} from "./RolePermissionDashboard";

export { HostAppBar } from "./HostAppBar";
export type { HostAppBarProps, CurrentAppletInfo } from "./HostAppBar";

export { AppletDrawer, AppletNavigation } from "./AppletDrawer";
export type {
  AppletDrawerProps,
  AppletNavigationProps,
  NavigationRoute,
} from "./AppletDrawer";

// MUI-compatible version of useAppletPermissions (if it exists)
// export { useAppletPermissions } from "./useAppletPermissionsMUI";

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

// Pure notification component (no state)
export { NotificationMenu } from "./NotificationMenu";

// Theme
export { lightTheme } from "./theme/light";
export { darkTheme } from "./theme/dark";

// Import themes for use in getTheme
import { lightTheme } from "./theme/light";
import { darkTheme } from "./theme/dark";

// Utility function to get theme by mode
export const getTheme = (mode: "light" | "dark" = "light") => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "light":
    default:
      return lightTheme;
  }
};
