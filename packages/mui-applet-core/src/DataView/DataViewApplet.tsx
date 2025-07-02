import React from "react";
import {
  useDataView,
  type DataViewConfig,
  type UseDataViewOptions,
} from "@smbc/react-query-dataview";
import { usePermissions, type PermissionDefinition, useHashParams } from "@smbc/applet-core";
import { MuiDataView } from "./MuiDataView";
import { ActionBar } from "../ActionBar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

// MUI-specific configuration that uses PermissionDefinition objects directly
export interface MuiDataViewAppletConfig<T>
  extends Omit<DataViewConfig<T>, "permissions" | "renderer"> {
  permissions?: {
    view?: PermissionDefinition;
    create?: PermissionDefinition;
    edit?: PermissionDefinition;
    delete?: PermissionDefinition;
  };
}

export interface MuiDataViewAppletProps<T extends Record<string, any>> {
  config: MuiDataViewAppletConfig<T>;
  className?: string;
  style?: React.CSSProperties;
  permissionContext?: string;
  /** Optional notification callbacks for user feedback */
  onSuccess?: (action: "create" | "edit" | "delete", item?: any) => void;
  onError?: (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => void;
  /** Enable URL hash parameter synchronization (default: false) */
  enableUrlSync?: boolean;
  /** Optional initial state from URL or external source */
  initialState?: {
    filters?: Record<string, any>;
    pagination?: { page: number; pageSize: number };
  };
  /** Optional callback for state changes (for URL sync) */
  onStateChange?: (state: {
    filters: Record<string, any>;
    pagination: { page: number; pageSize: number };
  }) => void;
  /** Optional useDataView options */
  options?: UseDataViewOptions;
}

/**
 * MuiDataViewApplet - A layered architecture for data management with permissions and UI
 *
 * ARCHITECTURE OVERVIEW:
 * This component implements a 3-layer architecture that separates concerns:
 *
 * Layer 1 (applet-dataview)
 * - Handles API calls, caching, optimistic updates
 * - Manages filters, pagination, selections, CRUD operations
 * - Takes simple string permissions and any actions you provide
 * - No knowledge of SMBC business logic or MUI components
 * - Reusable across different UI frameworks (React Native, etc.)
 *
 * Layer 2 (mui-applet-core)
 * - Converts PermissionDefinitions to simple strings
 * - Filters and processes actions based on user permissions
 * - Handles URL-based state
 * - Connects generic data operations to specific business handlers
 * - No knowledge of specific UI components, but MUI-aware
 *
 * Layer 3 (mui-components)
 * - Renders tables, forms, dialogs, action bars using MUI
 * - Handles user interactions and visual feedback
 * - No knowledge of data fetching or business logic
 *
 * FLOW EXAMPLE:
 * 1. User clicks "Edit" button (Layer 3: MUI ActionBar)
 * 2. Layer 2 checks permissions and processes the action
 * 3. Layer 1 handles the actual edit dialog state and API call
 * 4. Layer 3 renders the edit form dialog
 */
export function MuiDataViewApplet<T extends Record<string, any>>({
  config,
  className,
  style,
  permissionContext = "default",
  onSuccess,
  onError,
  enableUrlSync = false,
  initialState,
  onStateChange,
  options,
}: MuiDataViewAppletProps<T>) {
  const { hasPermission } = usePermissions();

  // URL sync functionality
  const urlState = useHashParams(
    config.filters?.initialValues || {},
    { page: 0, pageSize: config.pagination?.defaultPageSize || 10 },
    enableUrlSync
  );
  

  // Layer 2: - convert PermissionDefinition to boolean
  const canCreate = config.permissions?.create
    ? hasPermission(permissionContext, config.permissions.create)
    : false;

  // Layer 1: Prepare config for framework-agnostic data management
  // Strip out Layer 2 concepts (SMBC permissions, actions) before passing to Layer 1
  const baseConfigWithoutActions: DataViewConfig<T> = {
    ...config,
    renderer: MuiDataView,
    permissions: undefined, // Layer 1 uses simple strings, Layer 2 handles PermissionDefinition objects
    actions: {}, // Layer 2 will process and filter actions based on permissions
  };

  // Layer 2: State management - URL sync, custom callback, or let useDataView handle it
  const useCustomState = enableUrlSync || (onStateChange && !initialState);
  
  // Stabilize URL state setters to prevent focus loss
  const setUrlFilters = React.useCallback(
    (filters: any) => {
      if (enableUrlSync) {
        // Use updater function to completely replace filters, not merge
        urlState.setFilters(() => filters);
      }
    },
    [enableUrlSync, urlState.setFilters]
  );
  
  const setUrlPagination = React.useCallback(
    (paginationUpdateOrUpdater: any) => {
      if (enableUrlSync) {
        if (typeof paginationUpdateOrUpdater === 'function') {
          // It's an updater function - pass it through
          urlState.setPagination(paginationUpdateOrUpdater);
        } else {
          // It's an object - merge with previous state
          urlState.setPagination((prev: any) => {
            const newPagination = { ...prev, ...paginationUpdateOrUpdater };
            return newPagination;
          });
        }
      }
    },
    [enableUrlSync, urlState.setPagination]
  );
  
  const customFilterState = enableUrlSync 
    ? [urlState.filters, setUrlFilters] as const
    : React.useState(config.filters?.initialValues || {});
  const customPaginationState = enableUrlSync
    ? [urlState.pagination, setUrlPagination] as const
    : React.useState({
        page: 0,
        pageSize: config.pagination?.defaultPageSize || 10,
      });

  // Inject URL state after component initializes (if initial state provided)
  React.useEffect(() => {
    if (initialState?.filters && !enableUrlSync && customFilterState[1]) {
      customFilterState[1](initialState.filters);
    }
  }, [initialState?.filters, enableUrlSync]);

  React.useEffect(() => {
    if (initialState?.pagination && !enableUrlSync && customPaginationState[1]) {
      customPaginationState[1](initialState.pagination);
    }
  }, [initialState?.pagination, enableUrlSync]);

  // Notify wrapper of state changes (for non-URL sync cases)
  React.useEffect(() => {
    if (onStateChange && useCustomState && !enableUrlSync) {
      onStateChange({
        filters: customFilterState[0],
        pagination: customPaginationState[0],
      });
    }
  }, [
    customFilterState[0],
    customPaginationState[0],
    onStateChange,
    useCustomState,
    enableUrlSync,
  ]);

  // Layer 1: Framework-agnostic data management (API calls, state, mutations)
  const dataView = useDataView(baseConfigWithoutActions, {
    // Use custom state when URL sync enabled or external state management needed
    filterState: useCustomState ? {
      filters: customFilterState[0],
      setFilters: customFilterState[1]
    } : undefined,
    paginationState: useCustomState ? {
      pagination: customPaginationState[0],
      setPagination: customPaginationState[1]
    } : undefined,
    transformFilters: config.options?.transformFilters,
    getActiveColumns: config.options?.getActiveColumns,
    onSuccess,
    onError,
    // Merge in any additional options passed to the applet
    ...options,
  });

  // Track if transaction is executing to show loading state
  const [isTransactionExecuting, setIsTransactionExecuting] = React.useState(false);

  // Listen for transaction execution to show table loading state
  React.useEffect(() => {
    if (!dataView.transaction) return;

    // Poll transaction status to detect execution
    const checkTransactionStatus = () => {
      const transaction = dataView.transaction?.getTransaction();
      const isExecuting = transaction?.status === "executing";
      setIsTransactionExecuting(isExecuting || false);
    };

    // Check status every 100ms
    const interval = setInterval(checkTransactionStatus, 100);

    const handleExecutionEnd = () => {
      setIsTransactionExecuting(false);
    };

    // Listen to completion events
    dataView.transaction.on("onTransactionComplete", handleExecutionEnd);
    dataView.transaction.on("onTransactionError", handleExecutionEnd);
    dataView.transaction.on("onTransactionCancelled", handleExecutionEnd);

    return () => {
      clearInterval(interval);
      dataView.transaction?.off("onTransactionComplete", handleExecutionEnd);
      dataView.transaction?.off("onTransactionError", handleExecutionEnd);
      dataView.transaction?.off("onTransactionCancelled", handleExecutionEnd);
    };
  }, [dataView.transaction]);

  // Layer 2: process row actions with permission filtering and connect to Layer 1 handlers
  const processedRowActions =
    config.actions?.row?.map((action) => ({
      ...action,
      onClick: (item: T) => {
        if (action.key === "edit") {
          dataView.handleEdit(item);
        } else if (action.key === "delete") {
          dataView.handleDelete(item);
        } else {
          // Call the original onClick if it exists
          action.onClick?.(item);
        }
      },
    })) || [];

  // Layer 2: process bulk actions with permission filtering
  const processedBulkActions =
    config.actions?.bulk?.map((action) => ({
      ...action,
      onClick: (items: T[]) => {
        // Handle bulk operations - pass mutations and transaction support to the action handler
        if (typeof action.onClick === "function") {
          const originalOnClick = action.onClick;
          try {
            // Call with mutations and transaction support
            return originalOnClick(items, {
              updateMutation: dataView.updateMutation,
              deleteMutation: dataView.deleteMutation,
              createMutation: dataView.createMutation,
              transaction: dataView.transaction,
              addTransactionOperation: dataView.addTransactionOperation,
              getPendingData: (dataView as any).getPendingData,
            });
          } catch (error) {
            // Fallback to original call
            return originalOnClick(items);
          }
        }
      },
    })) || [];

  // Layer 2: process global actions with permission filtering
  const processedGlobalActions =
    config.actions?.global?.map((action) => ({
      ...action,
      onClick: () => {
        if (action.key === "create") {
          dataView.handleCreate();
        } else {
          // Call the original onClick if it exists
          action.onClick?.();
        }
      },
    })) || [];

  // Layer 2: Add default create action based on permissions if none configured
  if (
    canCreate &&
    !processedGlobalActions.some((action) => action.key === "create")
  ) {
    processedGlobalActions.push({
      type: "global",
      key: "create",
      label: "Create New",
      icon: AddIcon,
      color: "primary" as const,
      onClick: dataView.handleCreate,
    });
  }

  // Layer 2: Bridge Layer 1 data to Layer 3 components with processed actions
  const TableComponentWithActions = React.useMemo(() => {
    // Get the active columns from the dataView's internal logic
    const activeColumns = config.options?.getActiveColumns
      ? config.options.getActiveColumns(config.columns, dataView.filters)
      : config.columns;

    return () =>
      React.createElement(MuiDataView.TableComponent, {
        data: dataView.data,
        columns: activeColumns,
        actions: processedRowActions,
        isLoading: dataView.isLoading || isTransactionExecuting,
        error: dataView.error,
        selection: {
          enabled: true,
          selectedIds: dataView.selection.selectedIds,
          onSelectionChange: dataView.selection.setSelectedIds,
        },
        // Pass transaction state separately for UI components to handle merging
        transactionState: dataView.transactionState,
        primaryKey: config.schema.primaryKey,
      });
  }, [
    dataView.data,
    dataView.filters,
    config.columns,
    config.options?.getActiveColumns,
    processedRowActions,
    dataView.isLoading,
    dataView.error,
    dataView.selection,
    dataView.transactionState,
    isTransactionExecuting,
  ]);

  return (
    <div className={className} style={style}>
      <dataView.FilterComponent />

      <ActionBar
        globalActions={processedGlobalActions}
        bulkActions={processedBulkActions}
        selectedItems={dataView.selection.selectedItems}
        totalItems={dataView.data.length}
        onClearSelection={() => dataView.selection.setSelectedIds([])}
        transactionState={dataView.transactionState}
        primaryKey={config.schema.primaryKey}
      />

      <TableComponentWithActions />

      {config.pagination?.enabled && <dataView.PaginationComponent />}

      {dataView.createDialogOpen && <dataView.CreateFormComponent />}
      {dataView.editDialogOpen && dataView.editingItem && (
        <dataView.EditFormComponent item={dataView.editingItem} />
      )}
      {dataView.deleteDialogOpen &&
        dataView.deletingItem &&
        !dataView.transaction && (
          <Dialog
            open={dataView.deleteDialogOpen}
            onClose={() => dataView.setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this item? This action cannot be
                undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => dataView.setDeleteDialogOpen(false)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                onClick={() => dataView.handleDeleteConfirm()}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        )}
    </div>
  );
}
