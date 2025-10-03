// Import CSS custom properties for design tokens
import "@smbc/ui-core/tokens.css";

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

export { ActionMenu } from "./ActionMenu";

export { Divider } from "./Divider";
export type { DividerProps } from "./Divider";
export type { ActionMenuProps, ActionMenuItem } from "./ActionMenu";

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

// New CSS variable theme (works for both light and dark)
export { createCssVarTheme } from "./theme";
export * from "./theme/utils";

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

// AG Grid Utilities
export {
  gridOptions,
  checkboxColumn,
  expandColumn,
  actionsColumn,
  formatIsoDate,
  formatLocalDate,
  formatCurrency,
  formatNumber,
  AgGridTheme,
} from "./ag-grid";

// Console
export { Console } from "./Console";
export type { ConsoleProps } from "./Console";

// Export icons for tree-shaking
export * from "./icons";

// TabBar
export { TabBar } from "./TabBar";
export type { TabBarProps, TabBarItem } from "./TabBar";

// Button
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

// Tooltip
export { Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";

// Chip
export { Chip } from "./Chip";
export type { ChipProps } from "./Chip";

// Text (wrapper for MUI Typography)
export { Text } from "./Text";
export type { TextProps } from "./Text";

// TextField
export { TextField } from "./TextField";
export type { TextFieldProps } from "./TextField";

// Select
export { Select } from "./Select";
export type { SelectProps } from "./Select";

// Card
export { Card } from "./Card";
export type { CardProps, CardMenuItem } from "./Card";

// Table Components
export { KeyValueTable } from "./KeyValueTable";
export type { KV } from "./KeyValueTable";
export { Table } from "./Table";
export {
  Table as TableBase,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "./TableComponents";
export type {
  TableProps as TableBaseProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
} from "./TableComponents";

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

// Scrollbar utilities - TODO: Move to new theme system
// For now, create inline to avoid theme-old import
const getScrollbarStyles = () => ({});
export const darkScrollbarStyles = getScrollbarStyles();
export const lightScrollbarStyles = getScrollbarStyles();
