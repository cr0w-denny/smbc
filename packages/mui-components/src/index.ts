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

export { default as RowDetailModal } from "./RowDetailModal";
export type { 
  RowDetailModalProps, 
  TableColumn 
} from "./RowDetailModal";


export { TreeMenu } from "./TreeMenu";
export type {
  NavigationRoute,
  TreeMenuSection,
  TreeMenuGroup,
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
export { AppShell, UserMenu } from "./AppShell";
export type {
  AppShellProps,
  NavigationItem,
  TreeNavigationItem,
  StatusChip,
} from "./AppShell";

// AG Grid Theme
export { AgGridTheme } from "./AgGridTheme";

// Export icons for tree-shaking
export * from "./icons";
