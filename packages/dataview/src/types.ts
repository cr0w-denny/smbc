// Core data field definition
export interface DataField {
  name: string;
  type: "string" | "number" | "boolean" | "email" | "date" | "select";
  label?: string;
  required?: boolean;
  validation?: any; // Can be extended for specific validation rules
  options?: Array<{ label: string; value: any }> | string[]; // For select fields - can be string array for convenience
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
  // Functions to handle different API response structures
  responseRow?: (response: any) => any[]; // Extract data rows from response, defaults to response
  responseRowCount?: (response: any) => number; // Extract total row count, defaults to response.total or rows.length
  
  /**
   * Format cache updates to maintain proper response structure.
   * Used for:
   * 1. Optimistic updates during mutations (create/update/delete)
   * 2. Transaction mode cache updates (showing pending states)
   * 
   * This function ensures metadata like 'total' count is preserved when updating
   * the rows in the cache, preventing issues like incorrect pagination displays.
   */
  formatCacheUpdate?: (originalResponse: any, newRows: any[]) => any;
  
  // Additional query parameters to include in all requests
  apiParams?: Record<string, any>;
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

// Table action definition
// Base action interface
export interface BaseAction {
  key: string;
  label: string;
  icon?: React.ComponentType;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

// Row-level action (appears in each table row)
export interface RowAction<T> extends BaseAction {
  type: "row";
  onClick?: (item: T) => void;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

// Bulk action (appears in action bar when rows are selected)
export interface BulkAction<T> extends BaseAction {
  type: "bulk";
  onClick?: (items: T[], mutations?: any) => void;
  disabled?: (items: T[]) => boolean;
  hidden?: (items: T[]) => boolean;
  // If true, action is hidden when it doesn't apply to ALL selected rows
  requiresAllRows?: boolean;
  // Function to check if action applies to a specific row
  appliesTo?: (item: T) => boolean;
}

// Global action (appears in action bar, always visible)
export interface GlobalAction extends BaseAction {
  type: "global";
  onClick?: () => void;
  disabled?: () => boolean;
  hidden?: () => boolean;
}

// Union type for all actions
export type DataAction<T> = RowAction<T> | BulkAction<T> | GlobalAction;

// Pagination configuration
export interface PaginationConfig {
  enabled?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showFirstLast?: boolean;
}

// Permission configuration (using strings instead of PermissionDefinition)
export interface DataViewPermissions {
  view?: string;
  create?: string;
  edit?: string;
  delete?: string;
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

// Filter configuration - whatever the renderer expects
// The shape is defined by the renderer being used
export type DataViewFilterSpec = any;

// Component props interfaces
export interface DataViewTableProps<T, TRendererConfig = any> {
  data: T[];
  columns: DataColumn<T>[];
  actions?: RowAction<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRowClick?: (item: T, event?: React.MouseEvent) => void;
  selection?: {
    enabled: boolean;
    selectedIds: (string | number)[];
    onSelectionChange: (selectedIds: (string | number)[]) => void;
  };
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  };
  primaryKey?: keyof T;
  hover?: boolean;
  rendererConfig?: TRendererConfig;
}

export interface DataViewFilterProps {
  spec: DataViewFilterSpec;
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
  entityType?: string;
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

export interface DataViewCreateButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

// Renderer interface
export interface DataView<T, TRendererConfig = any> {
  name: string;
  TableComponent: React.ComponentType<DataViewTableProps<T, TRendererConfig>>;
  FilterComponent: React.ComponentType<DataViewFilterProps>;
  FormComponent: React.ComponentType<DataViewFormProps<T>>;
  CreateButtonComponent: React.ComponentType<DataViewCreateButtonProps>;
  PaginationComponent: React.ComponentType<DataViewPaginationProps>;
}

// Main configuration interface
export interface DataViewConfig<T, TRendererConfig = any> {
  // Required
  api: DataViewApiConfig;
  schema: DataSchema<T>;
  columns: DataColumn<T>[];
  renderer: DataView<T, TRendererConfig>;

  // Optional
  filters?: DataViewFilterSpec;
  permissions?: DataViewPermissions;
  actions?: {
    row?: RowAction<T>[];
    bulk?: BulkAction<T>[];
    global?: GlobalAction[];
  };
  pagination?: PaginationConfig;
  forms?: {
    create?: FormConfig<Partial<T>>;
    edit?: FormConfig<T>;
  };
  rendererConfig?: TRendererConfig; // Renderer-specific configuration
  /** Configuration for activity tracking and notifications */
  activity?: {
    /** Entity type name for activity tracking (e.g., 'user', 'task') */
    entityType?: string;
    /** Function to generate a label for an item in activities */
    labelGenerator?: (item: T) => string;
    /** Function to generate URLs for viewing items */
    urlGenerator?: (item: T) => string;
    /** Whether to track activities for this DataView */
    enabled?: boolean;
  };
}

// Import and re-export transaction types
import type {
  TransactionManager,
  TransactionOperation,
  OperationTrigger,
} from "./transaction/types";
export type { TransactionManager, TransactionOperation, OperationTrigger };

// Return type from useDataView hook
export interface DataViewResult<T> {
  // Data
  data: T[];
  isLoading: boolean;
  error: Error | null;
  total: number;

  // Filters
  filters: any;
  setFilters: (filters: any) => void;

  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  setPagination: (pagination: { page?: number; pageSize?: number }) => void;

  // Mutations
  createMutation: any; // Will be typed based on API client
  updateMutation: any;
  deleteMutation: any;

  // Components (pre-configured with data and handlers)
  TableComponent: React.ComponentType<{}>;
  CreateFormComponent: React.ComponentType<{}>;
  EditFormComponent: React.ComponentType<{ item: T }>;
  PaginationComponent: React.ComponentType<{}>;

  // Actions
  handleCreate: () => void;
  handleEdit: (item: T) => void;
  handleDelete: (item: T) => void;
  handleCreateSubmit: (data: Partial<T>) => Promise<void>;
  handleEditSubmit: (data: T) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;

  // Dialog states
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  editingItem: T | null;
  setEditingItem: (item: T | null) => void;
  deletingItem: T | null;
  setDeletingItem: (item: T | null) => void;

  // Selection
  selection: {
    selectedIds: (string | number)[];
    setSelectedIds: (ids: (string | number)[]) => void;
    selectedItems: T[];
    clearSelection: () => void;
  };

  // Actions
  actions: {
    row: RowAction<T>[];
    bulk: BulkAction<T>[];
    global: GlobalAction[];
  };

  // Transaction system
  transaction: TransactionManager<T> | null;
  addTransactionOperation: (
    type: "create" | "update" | "delete",
    entity: T,
    mutation: () => Promise<any>,
    trigger?: OperationTrigger,
    changedFields?: string[],
  ) => any;
  getPendingData: (entityId: string | number) => any;

  // Transaction state (separate from data)
  transactionState: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  };
}
