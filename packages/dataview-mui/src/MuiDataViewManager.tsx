import React from "react";
import {
  useDataView,
  type DataViewConfig,
  type UseDataViewOptions,
} from "@smbc/dataview";
import { useQueryClient } from "@tanstack/react-query";
import { MuiDataView } from "./MuiDataView";
import { Filter } from "@smbc/mui-components";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

// MUI-specific renderer configuration
export interface MuiRendererConfig {
  /** Transform filter values for query keys and API requests */
  transformFilters?: (filters: any) => any;
  /** Function to determine which columns to show based on current filters */
  getActiveColumns?: (columns: any[], filters: any) => any[];
  /** Enable hover effects on table rows */
  hover?: boolean;
  /** Use a dropdown menu for row actions instead of individual buttons */
  useRowActionsMenu?: boolean;
}

// Generic MUI DataView management configuration
export interface MuiDataViewManagerConfig<T>
  extends Omit<DataViewConfig<T, MuiRendererConfig>, "renderer"> {
  // Renderer is always MuiDataView for this manager
  /** Optional callback for row clicks */
  onRowClick?: (item: T, event?: React.MouseEvent) => void;
}

export interface MuiDataViewManagerProps<T extends Record<string, any>> {
  config: MuiDataViewManagerConfig<T>;
  className?: string;
  style?: React.CSSProperties;
  /** Optional notification callbacks for user feedback */
  onSuccess?: (action: "create" | "edit" | "delete", item?: any) => void;
  onError?: (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => void;
  /** Optional initial state from external source */
  initialState?: {
    filters?: Record<string, any>;
    pagination?: { page: number; pageSize: number };
  };
  /** Optional callback for state changes */
  onStateChange?: (state: {
    filters: Record<string, any>;
    pagination: { page: number; pageSize: number };
  }) => void;
  /** Optional useDataView options */
  options?: UseDataViewOptions;
  /** Custom filter state management */
  filterState?: {
    filters: Record<string, any>;
    setFilters: (filters: Record<string, any>) => void;
  };
  /** Custom pagination state management */
  paginationState?: {
    pagination: { page: number; pageSize: number };
    setPagination: (pagination: { page: number; pageSize: number }) => void;
  };
  /** Optional action bar component to render above the table */
  ActionBarComponent?: React.ComponentType<{
    globalActions: any[];
    bulkActions: any[];
    selectedItems: T[];
    totalItems: number;
    onClearSelection: () => void;
    transactionState?: any;
    primaryKey?: keyof T;
  }>;
}

/**
 * MuiDataViewManager - Generic data view management with MUI components
 *
 * This component provides the core management logic for data views using MUI components,
 * without any business-specific concerns like permissions or URL synchronization.
 * 
 * Features:
 * - Integrates useDataView with MUI renderer components
 * - Handles action processing and delegation
 * - Manages form dialogs and delete confirmations
 * - Supports transaction state visualization
 * - Provides hooks for external state management
 * - Allows custom action bars via render props
 */
export function MuiDataViewManager<T extends Record<string, any>>({
  config,
  className,
  style,
  onSuccess,
  onError,
  initialState,
  onStateChange,
  options,
  filterState,
  paginationState,
  ActionBarComponent,
}: MuiDataViewManagerProps<T>) {
  // Prepare config for framework-agnostic data management
  const baseConfig: DataViewConfig<T, MuiRendererConfig> = {
    ...config,
    renderer: MuiDataView,
  };

  // Create local state for non-custom state management
  const defaultFilters = React.useMemo(() => 
    config.filters?.initialValues || {}, 
    [config.filters?.initialValues]
  );
  
  const defaultPagination = React.useMemo(() => 
    ({ page: 0, pageSize: config.pagination?.defaultPageSize || 10 }), 
    [config.pagination?.defaultPageSize]
  );

  const [localFilters, setLocalFilters] = React.useState(defaultFilters);
  const [localPagination, setLocalPagination] = React.useState(defaultPagination);

  // Use custom state if provided, otherwise use local state
  const useCustomState = !!(filterState || paginationState);
  
  const currentFilterState = filterState || { 
    filters: localFilters, 
    setFilters: setLocalFilters 
  };
  
  const currentPaginationState = paginationState || { 
    pagination: localPagination, 
    setPagination: setLocalPagination 
  };

  // Inject initial state if provided
  React.useEffect(() => {
    if (initialState?.filters && !filterState) {
      setLocalFilters(initialState.filters);
    }
  }, [initialState?.filters, filterState]);

  React.useEffect(() => {
    if (initialState?.pagination && !paginationState) {
      setLocalPagination(initialState.pagination);
    }
  }, [initialState?.pagination, paginationState]);

  // Notify wrapper of state changes
  React.useEffect(() => {
    if (onStateChange && !useCustomState) {
      onStateChange({
        filters: currentFilterState.filters,
        pagination: currentPaginationState.pagination,
      });
    }
  }, [
    currentFilterState.filters,
    currentPaginationState.pagination,
    onStateChange,
    useCustomState,
  ]);

  // Framework-agnostic data management (API calls, state, mutations)
  const dataView = useDataView(baseConfig, {
    // Use custom state when provided
    filterState: useCustomState ? currentFilterState : undefined,
    paginationState: useCustomState ? currentPaginationState : undefined,
    transformFilters: config.rendererConfig?.transformFilters,
    getActiveColumns: config.rendererConfig?.getActiveColumns,
    onSuccess: (action, item) => {
      console.log(`DataView ${action} success:`, item);
      onSuccess?.(action, item);
    },
    onError: (action, error, item) => {
      console.error(`DataView ${action} error:`, error, item);
      onError?.(action, error, item);
    },
    // Merge in any additional options passed to the orchestrator
    ...options,
  });

  // Get access to the queryClient and build the query key for optimistic updates
  const queryClient = useQueryClient();
  
  // Build the current query key to match what useDataView creates
  const currentQueryKey = React.useMemo(() => {
    const transformedFilters = config.rendererConfig?.transformFilters 
      ? config.rendererConfig.transformFilters(dataView.filters)
      : dataView.filters;
      
    const queryParams = {
      params: {
        query: {
          page: dataView.pagination.page + 1, // useDataView adds 1 to the page
          pageSize: dataView.pagination.pageSize,
          ...transformedFilters,
        },
      },
    };
    
    return ["get", config.api.endpoint, queryParams];
  }, [config.api.endpoint, config.rendererConfig?.transformFilters, dataView.filters, dataView.pagination]);

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

  // Process row actions and connect to dataView handlers
  const processedRowActions =
    config.actions?.row?.map((action: any) => ({
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

  // Process bulk actions with enhanced context
  const processedBulkActions =
    config.actions?.bulk?.map((action: any) => ({
      ...action,
      onClick: (items: T[]) => {
        // Handle bulk operations - pass mutations and transaction support to the action handler
        if (typeof action.onClick === "function") {
          const originalOnClick = action.onClick;
          try {
            // Detect if optimistic mode is enabled (no transaction manager)
            const optimisticMode = !dataView.transaction;
            
            // Call with mutations, transaction support, and optimistic context
            return originalOnClick(items, {
              updateMutation: dataView.updateMutation,
              deleteMutation: dataView.deleteMutation,
              createMutation: dataView.createMutation,
              transaction: dataView.transaction,
              addTransactionOperation: dataView.addTransactionOperation,
              getPendingData: (dataView as any).getPendingData,
              // Optimistic update context
              optimisticMode,
              queryClient: optimisticMode ? queryClient : undefined,
              dataViewQueryKey: optimisticMode ? currentQueryKey : undefined,
            });
          } catch (error) {
            // Fallback to original call
            return originalOnClick(items);
          }
        }
      },
    })) || [];

  // Process global actions
  const processedGlobalActions =
    config.actions?.global?.map((action: any) => ({
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

  // Bridge data to MUI components with processed actions
  const TableComponentWithActions = React.useMemo(() => {
    // Get the active columns from the dataView's internal logic
    const activeColumns = config.rendererConfig?.getActiveColumns
      ? config.rendererConfig.getActiveColumns(config.columns, dataView.filters)
      : config.columns;

    return () => {
      console.log('TableComponentWithActions rendering with rendererConfig:', config.rendererConfig);
      console.log('TableComponentWithActions onRowClick:', config.onRowClick);
      return React.createElement(MuiDataView.TableComponent, {
        data: dataView.data,
        columns: activeColumns,
        actions: processedRowActions,
        isLoading: dataView.isLoading || isTransactionExecuting,
        error: dataView.error,
        onRowClick: config.onRowClick,
        selection: {
          enabled: true,
          selectedIds: dataView.selection.selectedIds,
          onSelectionChange: dataView.selection.setSelectedIds,
        },
        // Pass transaction state separately for UI components to handle merging
        transactionState: dataView.transactionState,
        primaryKey: config.schema.primaryKey,
        hover: config.rendererConfig?.hover || false,
        rendererConfig: config.rendererConfig,
      });
    };
  }, [
    dataView.data,
    dataView.filters,
    config.columns,
    config.rendererConfig,
    config.onRowClick,
    processedRowActions,
    dataView.isLoading,
    dataView.error,
    dataView.selection,
    dataView.transactionState,
    isTransactionExecuting,
  ]);

  // Create our own stable Filter component using JSX
  const FilterComponent = React.useMemo(() => {
    if (!config.filters) return null;
    
    console.log('🎯 FilterComponent memoizing with:', {
      filters: currentFilterState.filters,
      setFilters: !!currentFilterState.setFilters
    });
    
    return (
      <Filter
        spec={config.filters}
        values={currentFilterState.filters}
        onFiltersChange={(newFilters) => {
          console.log('🎯 Filter onChange triggered:', { 
            oldFilters: currentFilterState.filters,
            newFilters 
          });
          currentFilterState.setFilters(newFilters);
        }}
      />
    );
  }, [config.filters, currentFilterState.filters, currentFilterState.setFilters]);

  console.log('🔍 MuiDataViewManager rendering with:', {
    hasFilters: !!config.filters,
    hasFilterComponent: !!FilterComponent,
    currentFilters: currentFilterState.filters
  });

  return (
    <div className={className} style={style}>
      {FilterComponent}

      {ActionBarComponent && (
        <ActionBarComponent
          globalActions={processedGlobalActions}
          bulkActions={processedBulkActions}
          selectedItems={dataView.selection.selectedItems}
          totalItems={dataView.data.length}
          onClearSelection={() => dataView.selection.setSelectedIds([])}
          transactionState={dataView.transactionState}
          primaryKey={config.schema.primaryKey}
        />
      )}

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