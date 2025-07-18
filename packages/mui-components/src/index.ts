// Export all shared MUI components
export { LoadingTable } from "./LoadingTable";
export type { LoadingTableProps } from "./LoadingTable";

export { ConfirmationDialog } from "./ConfirmationDialog";
export type { ConfirmationDialogProps } from "./ConfirmationDialog";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";


export { AppletDrawer } from "./AppletDrawer";
export { TreeMenu } from "./TreeMenu";
export type {
  AppletDrawerProps,
  NavigationRoute,
  TreeMenuSection,
  TreeMenuGroup,
} from "./AppletDrawer";
export type { TreeMenuProps } from "./TreeMenu";

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
