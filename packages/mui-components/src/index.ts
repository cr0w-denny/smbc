
// Export all shared MUI components
export { LoadingTable } from "./LoadingTable";
export type { LoadingTableProps } from "./LoadingTable";

export { ConfirmationDialog } from "./ConfirmationDialog";
export type { ConfirmationDialogProps } from "./ConfirmationDialog";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { CustomSelect } from "./CustomSelect";
export type { CustomSelectProps } from "./CustomSelect";

export { Width } from "./Width";



export { TreeMenu } from "./TreeMenu";
export type {
  NavigationRoute,
  TreeMenuSection,
  TreeMenuGroup,
  TreeMenuHeader,
  TreeMenuProps,
} from "./TreeMenu";

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



export { lightTheme } from "./theme/light";
export { darkTheme } from "./theme/dark";
export { createTheme } from "./theme/base";
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

// App Shell
export { AppShell } from "./AppShell";

// User Menu
export { UserMenu } from "./UserMenu";
export type { UserMenuProps, UserRole } from "./UserMenu";
export type {
  AppShellProps,
  NavigationItem,
  TreeNavigationItem,
  ToolbarProps,
  PageProps,
} from "./AppShell";

// AG Grid Theme
export { AgGridTheme } from "./AgGridTheme";

// Export icons for tree-shaking
export * from "./icons";

// TabBar
export { TabBar } from "./TabBar";
export type { TabBarProps, TabBarItem } from "./TabBar";

// Card
export { Card } from "./Card";
export type { CardProps, CardMenuItem } from "./Card";

// Table Components
export { KeyValueTable } from "./KeyValueTable";
export type { KV } from "./KeyValueTable";
export { Table } from "./Table";

// Chip Toggle Group
export { ChipToggleGroup } from "./ChipToggleGroup";
export type { ChipToggleItem, ChipToggleGroupProps } from "./ChipToggleGroup";

// Logo
export { Logo } from "./Logo";
export type { LogoProps } from "./Logo";

// Dark Mode Switch
export { DarkModeSwitch } from "./DarkModeSwitch";
export type { DarkModeSwitchProps } from "./DarkModeSwitch";

// Status Chip
export { StatusChip } from "./StatusChip";
export type { StatusChipProps } from "./StatusChip";

// Related News
export { RelatedNews } from "./RelatedNews";
export type { RelatedNewsProps, NewsItem } from "./RelatedNews";

// Scrollbar utilities
export {
  darkScrollbarStyles,
  lightScrollbarStyles
} from "./theme/dark/scrollbar";

// Token utilities
export { token, t } from "./utils/tokens";
