import React, { useState, useMemo, useCallback } from "react";
import { useSMBCQuery } from "@smbc/shared-query-client";
import type { DataViewConfig, DataViewResult } from "./types";
import { useActivity } from "./activity";
import { SimpleTransactionManager } from "./transaction/TransactionManager";
import type { TransactionConfig, TransactionOperation, OperationTrigger } from "./transaction/types";
import { TransactionRegistry } from "./transaction/TransactionRegistry";
import { useHashParams } from "./useHashParams";

export interface UseDataViewOptions {
  /** Custom hook for managing filter state (e.g., URL-synced filters) */
  useFilterState?: (defaultFilters: any) => [any, (filters: any) => void];
  /** Custom hook for managing pagination state (e.g., URL-synced pagination) */
  usePaginationState?: (defaultPagination: any) => [any, (pagination: any) => void];
  /** Transform filter values for query keys and API requests */
  transformFilters?: (filters: any) => any;
  /** Function to determine which columns to show based on current filters */
  getActiveColumns?: (columns: any[], filters: any) => any[];
  /** Optional notification handlers for user feedback */
  onSuccess?: (action: 'create' | 'edit' | 'delete', item?: any) => void;
  onError?: (action: 'create' | 'edit' | 'delete', error: any, item?: any) => void;
  /** Transaction configuration for batch operations */
  transaction?: TransactionConfig;
  /** Enable URL hash synchronization for filters and pagination (default: true) */
  hashParams?: boolean;
  /** Namespace for hash params to avoid conflicts when multiple applets on same page */
  hashNamespace?: string;
}

export function useDataView<T extends Record<string, any>>(
  config: DataViewConfig<T>,
  options: UseDataViewOptions = {}
): DataViewResult<T> {
  const {
    api,
    schema,
    columns,
    renderer,
    filters: filterSpec,
    actions: actionConfig = {},
    pagination: paginationConfig = { enabled: true, defaultPageSize: 10 },
    forms,
    options: rendererOptions = {},
    activity: activityConfig,
  } = config;

  // Extract different action types
  const rowActions = actionConfig.row || [];
  const bulkActions = actionConfig.bulk || [];
  const globalActions = actionConfig.global || [];
  
  // Get the shared query client
  const { queryClient } = useSMBCQuery();

  // Activity tracking (optional)
  let activityContext;
  try {
    activityContext = useActivity();
  } catch {
    // ActivityProvider not found, activities disabled
    activityContext = null;
  }

  // No need for transaction context - we'll register directly with global registry

  // Transaction manager (optional) - use useState to keep it stable across re-renders
  const [transactionManager] = useState(() => {
    if (!options.transaction?.enabled) return null;
    
    const defaultConfig: TransactionConfig = {
      enabled: true,
      mode: 'immediate',
      autoCommit: true,
      requireConfirmation: false,
      showPendingIndicator: false,
      showReviewUI: false,
    };
    
    console.log('🔧 Creating new transaction manager with config:', options.transaction);
    return new SimpleTransactionManager<T>({ ...defaultConfig, ...options.transaction });
  });
  
  
  // Helper function to emit activities
  const emitActivity = useCallback((
    type: 'create' | 'update' | 'delete',
    item: T
  ) => {
    if (!activityConfig?.enabled || !activityContext) return;
    
    const entityType = activityConfig.entityType || 'item';
    const label = activityConfig.labelGenerator 
      ? activityConfig.labelGenerator(item)
      : (typeof schema.displayName === 'function' ? schema.displayName(item) : `${entityType} ${item[schema.primaryKey]}`);
    const url = activityConfig.urlGenerator ? activityConfig.urlGenerator(item) : undefined;
    
    activityContext.addActivity({
      type,
      entityType,
      label,
      url,
    });
  }, [activityConfig, activityContext, schema]);


  // State management with optional hash params support
  const defaultFilters = filterSpec?.initialValues || {};
  const defaultPagination = {
    page: 0,
    pageSize: paginationConfig.defaultPageSize || 10,
  };

  // Use hash params by default unless disabled or custom hooks provided
  const hashParamsEnabled = (options.hashParams !== false) && !options.useFilterState && !options.usePaginationState;
  
  const hashState = useHashParams(defaultFilters, defaultPagination, hashParamsEnabled, options.hashNamespace);
  
  // Choose between hash params, custom hooks, or local state
  const [filters, setFilters] = hashParamsEnabled 
    ? [hashState.filters, hashState.setFilters]
    : (options.useFilterState || useState)(defaultFilters);
    
  const [pagination, setPaginationState] = hashParamsEnabled
    ? [hashState.pagination, hashState.setPagination]
    : (options.usePaginationState || useState)(defaultPagination);

  // Selection state (optional)
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Helper to clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Extract data and total from query response using configurable functions
  const responseRow = api.responseRow || ((response: any) => Array.isArray(response) ? response : []);
  const responseRowCount = api.responseRowCount || ((response: any) => response?.total || response?.count || responseRow(response).length);
  const optimisticResponse = api.optimisticResponse || ((_originalResponse: any, newRows: any[]) => newRows);

  // Transform filters for consistent query keys and API requests
  const transformedFilters = useMemo(() => {
    return options.transformFilters ? options.transformFilters(filters) : filters;
  }, [filters, options.transformFilters]);

  // Dynamic columns based on filters or other conditions
  const activeColumns = useMemo(() => {
    if (options.getActiveColumns) {
      return options.getActiveColumns(columns, filters);
    }
    return columns;
  }, [columns, filters, options.getActiveColumns]);

  // Current query key for optimistic updates - must match openapi-react-query format
  const currentQueryKey = useMemo(() => {
    const queryParams = {
      params: {
        query: {
          page: pagination.page + 1,
          pageSize: pagination.pageSize,
          ...transformedFilters,
        },
      },
    };
    return [
      "get", 
      api.endpoint, 
      queryParams
    ];
  }, [api.endpoint, pagination.page, pagination.pageSize, transformedFilters, config.options?.apiParams]);

  // Register transaction manager directly with global registry
  React.useEffect(() => {
    if (transactionManager) {
      const managerId = `dataview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      TransactionRegistry.register(managerId, transactionManager);
      
      // Store snapshot for rollback when transaction starts
      let transactionSnapshot: any = null;
      
      const handleTransactionStart = () => {
        // Only capture snapshot if we don't have one yet
        if (!transactionSnapshot) {
          transactionSnapshot = queryClient.getQueryData(currentQueryKey);
          console.log('📸 Captured transaction snapshot for rollback');
        }
      };
      
      const handleTransactionCancelled = () => {
        // Clear all pending states instead of full rollback
        console.log('🔄 Transaction cancelled, clearing pending states...');
        queryClient.setQueryData(currentQueryKey, (old: any) => {
          if (!old) return old;
          
          const currentRows = responseRow(old);
          // Remove items that were pending creation and clear pending states from others
          const clearedRows = currentRows
            .filter((item: any) => item.__pendingState !== 'added') // Remove pending adds
            .map((item: any) => {
              // Remove pending state metadata
              const { __pendingState, __pendingOperationId, ...cleanItem } = item;
              return cleanItem;
            });
          
          console.log('✅ Cleared pending states, rows:', clearedRows.length);
          return optimisticResponse ? optimisticResponse(old, clearedRows) : clearedRows;
        });
        transactionSnapshot = null;
      };
      
      const handleTransactionComplete = (results: any[]) => {
        // Clear pending states and invalidate queries to get fresh data from server
        console.log('✅ Transaction completed, clearing pending states and refreshing data');
        
        // Emit activities for all successful operations on transaction commit (only if explicitly enabled)
        if (activityConfig?.enabled && activityContext && options.transaction?.emitActivities === true) {
          results.forEach((result: any) => {
            if (result.success && result.operation) {
              const operation = result.operation;
              const entityType = activityConfig.entityType || 'item';
              const label = activityConfig.labelGenerator 
                ? activityConfig.labelGenerator(operation.entity)
                : operation.label || `${operation.type} ${entityType}`;
              const url = activityConfig.urlGenerator ? activityConfig.urlGenerator(operation.entity) : undefined;
              
              activityContext.addActivity({
                type: operation.type,
                entityType,
                label,
                url,
              });
            }
          });
        }
        
        queryClient.setQueryData(currentQueryKey, (old: any) => {
          if (!old) return old;
          
          const currentRows = responseRow(old);
          // Clear all pending state metadata
          const clearedRows = currentRows.map((item: any) => {
            const { __pendingState, __pendingOperationId, ...cleanItem } = item;
            return cleanItem;
          });
          
          return optimisticResponse ? optimisticResponse(old, clearedRows) : clearedRows;
        });
        
        // Now that pending states are cleared, refetch to get the actual server state
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
        
        transactionSnapshot = null;
      };
      
      // Listen to transaction events for rollback
      transactionManager.on('onTransactionStart', handleTransactionStart);
      transactionManager.on('onTransactionCancelled', handleTransactionCancelled);
      transactionManager.on('onTransactionComplete', handleTransactionComplete);
      
      return () => {
        TransactionRegistry.unregister(managerId);
        transactionManager.off('onTransactionStart', handleTransactionStart);
        transactionManager.off('onTransactionCancelled', handleTransactionCancelled);
        transactionManager.off('onTransactionComplete', handleTransactionComplete);
      };
    }
  }, [transactionManager, queryClient, currentQueryKey]);

  // API Query - This will need to be implemented based on the specific API client
  // For now, we'll create a placeholder that can be overridden
  const queryParams = {
    params: {
      query: {
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        ...transformedFilters,
        ...(config.options?.apiParams || {}),
      },
    },
  };
  
  const {
    data: queryData,
    isLoading,
    error,
  } = api.client.useQuery?.("get", api.endpoint, queryParams) || { data: null, isLoading: false, error: null };

  const data = responseRow(queryData);
  const total = responseRowCount(queryData);

  // Mutations with optimistic updates
  const createMutation = api.client.useMutation?.("post", api.endpoint, {
    onMutate: async (variables: any) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: currentQueryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(currentQueryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;
        
        const currentRows = responseRow(old);
        
        // Create optimistic item with temporary ID
        const optimisticItem = {
          ...variables.body,
          [schema.primaryKey]: `temp-${Date.now()}`, // Temporary ID for optimistic update
          createdAt: new Date().toISOString(),
        };
        
        // Add to beginning of array (most recent first)
        const updatedRows = [optimisticItem, ...currentRows];
        
        // Use optimisticResponse if provided, otherwise create a simple response
        if (optimisticResponse) {
          return optimisticResponse(old, updatedRows);
        } else {
          // Fallback: assume simple array response
          return updatedRows;
        }
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: any, _variables: any, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.('create', error);
    },
    onSuccess: (newItem: any) => {
      options.onSuccess?.('create', newItem);
      // Emit activity: always if no transactions, only if explicitly enabled when transactions are on
      const shouldEmitActivity = !transactionManager || options.transaction?.emitActivities === true;
      if (shouldEmitActivity) {
        emitActivity('create', newItem);
      }
      
      // Update the optimistic item with the real server response
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;
        
        const currentRows = responseRow(old);
        
        // Replace the temporary item with the real one from server
        const updatedRows = currentRows.map((item: any) => {
          // Find the temporary item and replace it
          if (typeof item[schema.primaryKey] === 'string' && item[schema.primaryKey].startsWith('temp-')) {
            return { ...newItem }; // Use server response
          }
          return item;
        });
        
        if (optimisticResponse) {
          return optimisticResponse(old, updatedRows);
        } else {
          return updatedRows;
        }
      });
      
      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    }
  }) || {
    mutate: () => {},
    isPending: false,
  };

  const updateMutation = api.client.useMutation?.("patch", `${api.endpoint}/{id}`, {
    onMutate: async (variables: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(currentQueryKey);
      
      // Optimistically update the cache
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;
        
        const currentRows = responseRow(old);
        const primaryKey = schema.primaryKey;
        const itemId = variables.params?.path?.id;
        
        const updatedRows = currentRows.map((item: T) => 
          item[primaryKey] === itemId 
            ? { ...item, ...variables.body }
            : item
        );
        
        return optimisticResponse(old, updatedRows);
      });
      
      return { previousData };
    },
    onError: (error: any, variables: any, context: any) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.('edit', error, variables.body);
    },
    onSuccess: (_data: any, variables: any) => {
      options.onSuccess?.('edit', variables.body);
      // Emit activity: always if no transactions, only if explicitly enabled when transactions are on
      const shouldEmitActivity = !transactionManager || options.transaction?.emitActivities === true;
      if (shouldEmitActivity) {
        emitActivity('update', variables.body);
      }
      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    }
  }) || {
    mutate: () => {},
    isPending: false,
  };

  const deleteMutation = api.client.useMutation?.("delete", `${api.endpoint}/{id}`, {
    onMutate: async (variables: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(currentQueryKey);
      
      // Optimistically remove the item from cache
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;
        
        const currentRows = responseRow(old);
        const primaryKey = schema.primaryKey;
        const itemId = variables.params?.path?.id;
        
        const filteredRows = currentRows.filter((item: T) => item[primaryKey] !== itemId);
        
        return optimisticResponse(old, filteredRows);
      });
      
      return { previousData, deletedItem: deletingItem };
    },
    onError: (error: any, _variables: any, context: any) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.('delete', error, context?.deletedItem);
    },
    onSuccess: (_data: any, _variables: any, context: any) => {
      options.onSuccess?.('delete', context?.deletedItem);
      // Emit activity: always if no transactions, only if explicitly enabled when transactions are on
      const shouldEmitActivity = !transactionManager || options.transaction?.emitActivities === true;
      if (context?.deletedItem && shouldEmitActivity) {
        emitActivity('delete', context.deletedItem);
      }
      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    }
  }) || {
    mutate: () => {},
    isPending: false,
  };

  // Helper function to add operations to transaction
  const addTransactionOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    entity: T,
    mutation: () => Promise<any>,
    trigger: OperationTrigger = 'user-edit',
    changedFields?: string[]
  ) => {
    if (!transactionManager) {
      // No transaction manager, execute immediately
      return mutation();
    }

    // Start transaction if this is the first operation (captures snapshot for rollback)
    if (!transactionManager.hasOperations()) {
      console.log('🚀 Starting new transaction');
      transactionManager.begin();
    }

    // Add visual pending state instead of actually modifying data
    // This avoids pagination issues while providing immediate visual feedback
    console.log('🎨 Adding visual pending state for operation', { type, entityId: entity[schema.primaryKey] });
    const previousData = queryClient.getQueryData(currentQueryKey);
    
    queryClient.setQueryData(currentQueryKey, (old: any) => {
      if (!old) {
        console.log('❌ No old data found for pending state update');
        return old;
      }
      
      const currentRows = responseRow(old);
      const primaryKey = schema.primaryKey;
      let updatedRows: T[];

      if (type === 'create') {
        // Add new item to beginning with pending state
        const pendingItem = {
          ...entity,
          [primaryKey]: entity[primaryKey] || `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          __pendingState: 'added' as const,
          __pendingOperationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        updatedRows = [pendingItem, ...currentRows];
        console.log('➕ Added pending new item, total rows:', updatedRows.length);
      } else if (type === 'update') {
        // Mark existing item as pending update (last operation wins)
        updatedRows = currentRows.map((item: T) => {
          if (item[primaryKey] === entity[primaryKey]) {
            const existingState = (item as any).__pendingState;
            if (existingState === 'deleted') {
              console.log('🔄 Replacing pending delete with update for item:', entity[primaryKey]);
            }
            return { 
              ...item, 
              ...entity, 
              __pendingState: 'edited' as const,
              __pendingOperationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
          }
          return item;
        });
        console.log('✏️ Marked item as pending edit with ID:', entity[primaryKey]);
      } else if (type === 'delete') {
        // Mark item as pending delete (overrides any previous pending state)
        updatedRows = currentRows.map((item: T) => {
          if (item[primaryKey] === entity[primaryKey]) {
            // Delete operation takes precedence over any other pending state
            const existingState = (item as any).__pendingState;
            if (existingState) {
              console.log(`🔄 Replacing pending ${existingState} with delete for item:`, entity[primaryKey]);
            }
            return { 
              ...item, 
              __pendingState: 'deleted' as const,
              __pendingOperationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
          }
          return item;
        });
        console.log('🗑️ Marked item as pending delete with ID:', entity[primaryKey]);
      } else {
        updatedRows = currentRows;
      }

      const result = optimisticResponse ? optimisticResponse(old, updatedRows) : updatedRows;
      console.log('✅ Visual pending state applied:', result);
      return result;
    });

    const entityType = activityConfig?.entityType || 'item';
    const label = activityConfig?.labelGenerator 
      ? activityConfig.labelGenerator(entity)
      : `${type} ${entityType}`;

    // Store original data for rollback
    const originalItem = previousData ? responseRow(previousData).find((item: T) => item[schema.primaryKey] === entity[schema.primaryKey]) : undefined;

    const operation: Omit<TransactionOperation<T>, 'id' | 'timestamp'> = {
      type,
      trigger,
      entity,
      entityId: entity[schema.primaryKey],
      originalData: originalItem,
      changedFields,
      label,
      mutation,
      color: type === 'create' ? 'success' : type === 'update' ? 'primary' : 'error',
    };

    return transactionManager.addOperation(operation);
  }, [transactionManager, activityConfig, schema, queryClient, currentQueryKey, responseRow, optimisticResponse]);

  // Helper to update pagination
  const setPagination = useCallback((updates: { page?: number; pageSize?: number }) => {
    setPaginationState((prev: any) => ({
      ...prev,
      ...updates,
    }));
  }, [setPaginationState]);

  // Action handlers
  const handleCreate = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (item: T) => {
    setDeletingItem(item);
    // If transaction mode is enabled, skip the dialog and delete directly
    if (transactionManager) {
      const primaryKey = schema.primaryKey;
      try {
        await addTransactionOperation(
          'delete',
          item,
          () => deleteMutation.mutate({
            params: { path: { id: item[primaryKey] } },
          }),
          'user-edit'
        );
      } catch (error) {
        // Error is handled by mutation onError callback
      }
    } else {
      setDeleteDialogOpen(true);
    }
  }, [transactionManager, schema.primaryKey, addTransactionOperation, deleteMutation]);

  const handleCreateSubmit = useCallback(async (data: Partial<T>) => {
    const tempEntity = { ...data, [schema.primaryKey]: `temp_${Date.now()}` } as T;
    
    try {
      await addTransactionOperation(
        'create',
        tempEntity,
        () => createMutation.mutate({ body: data }),
        'user-edit'
      );
      setCreateDialogOpen(false);
    } catch (error) {
      // Error is handled by mutation onError callback
    }
  }, [createMutation, addTransactionOperation, schema.primaryKey]);

  const handleEditSubmit = useCallback(async (data: T) => {
    if (!editingItem) return;
    const primaryKey = schema.primaryKey;
    
    // Create the updated entity with the original item's primary key
    const updatedEntity = {
      ...editingItem,
      ...data,
      [primaryKey]: editingItem[primaryKey], // Ensure primary key is preserved
    };
    
    try {
      await addTransactionOperation(
        'update',
        updatedEntity,
        () => updateMutation.mutate({
          params: { path: { id: editingItem[primaryKey] } },
          body: data,
        }),
        'user-edit'
      );
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Error is handled by mutation onError callback
      // Keep dialog open so user can retry
    }
  }, [updateMutation, editingItem, schema.primaryKey, addTransactionOperation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    const primaryKey = schema.primaryKey;
    try {
      await addTransactionOperation(
        'delete',
        deletingItem,
        () => deleteMutation.mutate({
          params: { path: { id: deletingItem[primaryKey] } },
        }),
        'user-edit'
      );
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      // Error is handled by mutation onError callback
      // Keep dialog open so user can retry
    }
  }, [deleteMutation, deletingItem, schema.primaryKey, addTransactionOperation]);

  // Selection helpers
  const selectedItems = useMemo(() => {
    const primaryKey = schema.primaryKey;
    return data.filter((item: T) => selectedIds.includes(item[primaryKey]));
  }, [data, selectedIds, schema.primaryKey]);

  // Pre-configured components
  const TableComponent = useMemo(() => {
    const Component = renderer.TableComponent;
    return () =>
      React.createElement(Component, {
        data,
        columns: renderer.mapColumns ? renderer.mapColumns(activeColumns) : activeColumns,
        actions: rowActions,
        isLoading,
        error,
        selection: {
          enabled: true,
          selectedIds,
          onSelectionChange: setSelectedIds,
        },
        ...rendererOptions,
      });
  }, [renderer, data, activeColumns, rowActions, isLoading, error, selectedIds, rendererOptions]);

  const FilterComponent = useMemo(() => {
    if (!filterSpec) return () => null;
    
    return () =>
      React.createElement(renderer.FilterComponent, {
        spec: renderer.mapFilters ? renderer.mapFilters(filterSpec) : filterSpec,
        values: filters,
        onFiltersChange: setFilters,
        ...rendererOptions,
      });
  }, [renderer, filterSpec, setFilters, rendererOptions]); // Removed filters from dependencies

  const CreateFormComponent = useMemo(() => {
    const createForm = forms?.create;
    if (!createForm) return () => null;

    const entityType = activityConfig?.entityType || 'Item';

    return () =>
      React.createElement(renderer.FormComponent, {
        mode: "create",
        fields: renderer.mapFormFields ? renderer.mapFormFields(createForm.fields) : createForm.fields,
        onSubmit: handleCreateSubmit,
        onCancel: () => setCreateDialogOpen(false),
        isSubmitting: createMutation.isPending,
        entityType,
        ...rendererOptions,
      });
  }, [renderer, forms?.create, handleCreateSubmit, createMutation.isPending, rendererOptions, activityConfig?.entityType]);

  const EditFormComponent = useMemo(() => {
    const editForm = forms?.edit;
    if (!editForm) return () => null;

    const entityType = activityConfig?.entityType || 'Item';

    return ({ item }: { item: T }) =>
      React.createElement(renderer.FormComponent, {
        mode: "edit",
        fields: renderer.mapFormFields ? renderer.mapFormFields(editForm.fields) : editForm.fields,
        initialValues: item,
        onSubmit: handleEditSubmit,
        onCancel: () => {
          setEditDialogOpen(false);
          setEditingItem(null);
        },
        isSubmitting: updateMutation.isPending,
        entityType,
        ...rendererOptions,
      });
  }, [renderer, forms?.edit, handleEditSubmit, updateMutation.isPending, rendererOptions, activityConfig?.entityType]);

  const PaginationComponent = useMemo(() => {
    if (!paginationConfig.enabled) return () => null;
    
    return () =>
      React.createElement(renderer.PaginationComponent, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        onPageChange: (page: number) => setPagination({ page }),
        onPageSizeChange: (pageSize: number) => setPagination({ pageSize, page: 0 }),
        pageSizeOptions: paginationConfig.pageSizeOptions,
        ...rendererOptions,
      });
  }, [renderer, pagination.page, pagination.pageSize, total, setPagination, paginationConfig, rendererOptions]);

  return {
    // Data
    data,
    isLoading,
    error,
    total,

    // Filters
    filters,
    setFilters,

    // Pagination
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
    },
    setPagination,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,

    // Components
    TableComponent,
    FilterComponent,
    CreateFormComponent,
    EditFormComponent,
    PaginationComponent,

    // Actions
    handleCreate,
    handleEdit,
    handleDelete,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteConfirm,

    // Dialog states
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,

    // Selection
    selection: {
      selectedIds,
      setSelectedIds,
      selectedItems,
      clearSelection,
    },

    // Actions
    actions: {
      row: rowActions,
      bulk: bulkActions,
      global: globalActions,
    },

    // Transaction system
    transaction: transactionManager,
    addTransactionOperation,
  };
}