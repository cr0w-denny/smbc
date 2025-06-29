import type { PermissionDefinition } from "../permissions";

// Core data field definition
export interface DataField {
  name: string;
  type: "string" | "number" | "boolean" | "email" | "date" | "select";
  label?: string;
  required?: boolean;
  validation?: any; // Can be extended for specific validation rules
  options?: Array<{ label: string; value: any }>; // For select fields
}

// Schema definition for the data type
export interface DataSchema<T> {
  fields: DataField[];
  primaryKey: keyof T;
  displayName: (item: T) => string;
}

// API configuration
export interface DataViewApiConfig {
  endpoint: string;
  client: any; // Will be typed based on the specific API client
  queryKey?: string;
}

// Table column definition
export interface DataColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
}

// Import action types for use in this file
import type {
  RowAction,
} from "@smbc/react-dataview";

// Re-export action types from react-dataview
export type {
  RowAction,
  BulkAction,
  GlobalAction,
} from "@smbc/react-dataview";

// Pagination configuration
export interface PaginationConfig {
  enabled?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showFirstLast?: boolean;
}

// Permission configuration
export interface DataViewPermissions {
  view?: PermissionDefinition;
  create?: PermissionDefinition;
  edit?: PermissionDefinition;
  delete?: PermissionDefinition;
}

// Form configuration
export interface FormConfig<T> {
  fields: DataField[];
  validation?: any;
  onSubmit?: (data: T) => void | Promise<void>;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

// Renderer interface
export interface DataView<T> {
  name: string;
  TableComponent: React.ComponentType<DataViewTableProps<T>>;
  FilterComponent: React.ComponentType<DataViewFilterProps>;
  FormComponent: React.ComponentType<DataViewFormProps<T>>;
  PaginationComponent: React.ComponentType<DataViewPaginationProps>;

  // Transform functions for renderer-specific formats
  mapColumns?: (columns: DataColumn<T>[]) => any;
  mapFilters?: (filters: DataViewFilterSpec) => any;
  mapFormFields?: (fields: DataField[]) => any;
}

// Component props interfaces
export interface DataViewTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  actions?: RowAction<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRowClick?: (item: T) => void;
  selection?: {
    enabled: boolean;
    selectedIds: (string | number)[];
    onSelectionChange: (selectedIds: (string | number)[]) => void;
  };
}

// Filter field configuration for DataView
export interface DataViewFilterFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "search"
    | "select"
    | "number"
    | "boolean"
    | "checkbox"
    | "hidden";
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  debounceMs?: number;
}

// Filter specification for DataView
export interface DataViewFilterSpec {
  fields: DataViewFilterFieldConfig[];
  initialValues: Record<string, any>;
  title?: string;
  visible?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showClearButton?: boolean;
  showFilterCount?: boolean;
  debounceMs?: number;
}

export interface DataViewFilterProps {
  spec: any; // Will be mapped by renderer
  values: any;
  onFiltersChange: (values: any) => void;
}

export interface DataViewFormProps<T> {
  mode: "create" | "edit";
  fields: DataField[];
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: Error | null;
}

export interface DataViewPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showFirstLast?: boolean;
}

// Re-export from react-dataview for convenience
export type { DataViewConfig, DataViewResult } from "@smbc/react-dataview";
