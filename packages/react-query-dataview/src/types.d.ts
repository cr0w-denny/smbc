export interface DataField {
    name: string;
    type: "string" | "number" | "boolean" | "email" | "date" | "select";
    label?: string;
    required?: boolean;
    validation?: any;
    options?: Array<{
        label: string;
        value: any;
    }>;
}
export interface DataSchema<T> {
    fields: DataField[];
    primaryKey: keyof T;
    displayName: (item: T) => string;
}
export interface DataViewApiConfig {
    endpoint: string;
    client: any;
    queryKey?: string;
    responseRow?: (response: any) => any[];
    responseRowCount?: (response: any) => number;
    optimisticResponse?: (originalResponse: any, newRows: any[]) => any;
}
export interface DataColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (item: T) => React.ReactNode;
    width?: number | string;
    sx?: any;
}
export interface BaseAction {
    key: string;
    label: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}
export interface RowAction<T> extends BaseAction {
    type: "row";
    onClick?: (item: T) => void;
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
}
export interface BulkAction<T> extends BaseAction {
    type: "bulk";
    onClick?: (items: T[], mutations?: any) => void;
    disabled?: (items: T[]) => boolean;
    hidden?: (items: T[]) => boolean;
    requiresAllRows?: boolean;
    appliesTo?: (item: T) => boolean;
}
export interface GlobalAction extends BaseAction {
    type: "global";
    onClick?: () => void;
    disabled?: () => boolean;
    hidden?: () => boolean;
}
export type DataAction<T> = RowAction<T> | BulkAction<T> | GlobalAction;
export interface PaginationConfig {
    enabled?: boolean;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    showInfo?: boolean;
    showFirstLast?: boolean;
}
export interface DataViewPermissions {
    view?: string;
    create?: string;
    edit?: string;
    delete?: string;
}
export interface FormConfig<T> {
    fields: DataField[];
    validation?: any;
    onSubmit?: (data: T) => void | Promise<void>;
    title?: string;
    submitLabel?: string;
    cancelLabel?: string;
}
export interface DataViewFilterFieldConfig {
    name: string;
    label: string;
    type: "text" | "search" | "select" | "number" | "boolean" | "checkbox" | "hidden";
    placeholder?: string;
    options?: Array<{
        label: string;
        value: any;
    }>;
    defaultValue?: any;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    fullWidth?: boolean;
    size?: "small" | "medium";
    debounceMs?: number;
    /** Exclude this field from the active filter count */
    excludeFromCount?: boolean;
}
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
export interface DataView<T> {
    name: string;
    TableComponent: React.ComponentType<DataViewTableProps<T>>;
    FilterComponent: React.ComponentType<DataViewFilterProps>;
    FormComponent: React.ComponentType<DataViewFormProps<T>>;
    CreateButtonComponent: React.ComponentType<DataViewCreateButtonProps>;
    PaginationComponent: React.ComponentType<DataViewPaginationProps>;
    mapColumns?: (columns: DataColumn<T>[]) => any;
    mapFilters?: (filters: DataViewFilterSpec) => any;
    mapFormFields?: (fields: DataField[]) => any;
}
export interface DataViewConfig<T> {
    api: DataViewApiConfig;
    schema: DataSchema<T>;
    columns: DataColumn<T>[];
    renderer: DataView<T>;
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
    options?: Record<string, any>;
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
import type { TransactionManager, TransactionOperation, OperationTrigger } from "./transaction/types";
export type { TransactionManager, TransactionOperation, OperationTrigger };
export interface DataViewResult<T> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
    total: number;
    filters: any;
    setFilters: (filters: any) => void;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
    };
    setPagination: (pagination: {
        page?: number;
        pageSize?: number;
    }) => void;
    createMutation: any;
    updateMutation: any;
    deleteMutation: any;
    TableComponent: React.ComponentType<{}>;
    FilterComponent: React.ComponentType<{}>;
    CreateFormComponent: React.ComponentType<{}>;
    EditFormComponent: React.ComponentType<{
        item: T;
    }>;
    PaginationComponent: React.ComponentType<{}>;
    handleCreate: () => void;
    handleEdit: (item: T) => void;
    handleDelete: (item: T) => void;
    handleCreateSubmit: (data: Partial<T>) => Promise<void>;
    handleEditSubmit: (data: T) => Promise<void>;
    handleDeleteConfirm: () => Promise<void>;
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
    selection: {
        selectedIds: (string | number)[];
        setSelectedIds: (ids: (string | number)[]) => void;
        selectedItems: T[];
        clearSelection: () => void;
    };
    actions: {
        row: RowAction<T>[];
        bulk: BulkAction<T>[];
        global: GlobalAction[];
    };
    transaction: TransactionManager<T> | null;
    addTransactionOperation: (type: "create" | "update" | "delete", entity: T, mutation: () => Promise<any>, trigger?: OperationTrigger, changedFields?: string[]) => any;
    getPendingData: (entityId: string | number) => any;
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
//# sourceMappingURL=types.d.ts.map