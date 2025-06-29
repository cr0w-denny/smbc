import React, { useState, useMemo, useCallback } from "react";
import { useSMBCQuery } from "@smbc/shared-query-client";
import type { DataViewConfig, DataViewResult } from "./types";

export interface UseDataViewOptions {
  /** Custom hook for managing filter state (e.g., URL-synced filters) */
  useFilterState?: (defaultFilters: any) => [any, (filters: any) => void];
  /** Transform filter values for query keys and API requests */
  transformFilters?: (filters: any) => any;
  /** Function to determine which columns to show based on current filters */
  getActiveColumns?: (columns: any[], filters: any) => any[];
  /** Optional notification handlers for user feedback */
  onSuccess?: (action: 'create' | 'edit' | 'delete', item?: any) => void;
  onError?: (action: 'create' | 'edit' | 'delete', error: any, item?: any) => void;
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
  } = config;

  // Extract different action types
  const rowActions = actionConfig.row || [];
  const bulkActions = actionConfig.bulk || [];
  const globalActions = actionConfig.global || [];
  
  // Get the shared query client
  const { queryClient } = useSMBCQuery();


  // Filter state (either custom hook or local state)
  const defaultFilters = filterSpec?.initialValues || {};
  const useFilterStateHook = options.useFilterState || useState;
  const [filters, setFilters] = useFilterStateHook(defaultFilters);

  // Pagination state
  const [pagination, setPaginationState] = useState({
    page: 0,
    pageSize: paginationConfig.defaultPageSize || 10,
  });

  // Selection state (optional)
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

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
    onSuccess: (newItem: any) => {
      options.onSuccess?.('create', newItem);
      // Invalidate to refresh and show the new item in proper sort order
      queryClient.invalidateQueries({
        queryKey: ["get", api.endpoint],
        exact: false,
      });
    },
    onError: (error: any) => {
      options.onError?.('create', error);
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
      // Still invalidate to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: ["get", api.endpoint],
        exact: false,
      });
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
      // Still invalidate to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: ["get", api.endpoint],
        exact: false,
      });
    }
  }) || {
    mutate: () => {},
    isPending: false,
  };

  // Helper to update pagination
  const setPagination = useCallback((updates: { page?: number; pageSize?: number }) => {
    setPaginationState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Action handlers
  const handleCreate = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item: T) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(async (data: Partial<T>) => {
    try {
      await createMutation.mutate({ body: data });
      setCreateDialogOpen(false);
    } catch (error) {
      // Error is handled by mutation onError callback
    }
  }, [createMutation]);

  const handleEditSubmit = useCallback(async (data: T) => {
    if (!editingItem) return;
    const primaryKey = schema.primaryKey;
    try {
      await updateMutation.mutate({
        params: { path: { id: editingItem[primaryKey] } },
        body: data,
      });
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Error is handled by mutation onError callback
      // Keep dialog open so user can retry
    }
  }, [updateMutation, editingItem, schema.primaryKey]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    const primaryKey = schema.primaryKey;
    try {
      await deleteMutation.mutate({
        params: { path: { id: deletingItem[primaryKey] } },
      });
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      // Error is handled by mutation onError callback
      // Keep dialog open so user can retry
    }
  }, [deleteMutation, deletingItem, schema.primaryKey]);

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

    return () =>
      React.createElement(renderer.FormComponent, {
        mode: "create",
        fields: renderer.mapFormFields ? renderer.mapFormFields(createForm.fields) : createForm.fields,
        onSubmit: handleCreateSubmit,
        onCancel: () => setCreateDialogOpen(false),
        isSubmitting: createMutation.isPending,
        ...rendererOptions,
      });
  }, [renderer, forms?.create, handleCreateSubmit, createMutation.isPending, rendererOptions]);

  const EditFormComponent = useMemo(() => {
    const editForm = forms?.edit;
    if (!editForm) return () => null;

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
        ...rendererOptions,
      });
  }, [renderer, forms?.edit, handleEditSubmit, updateMutation.isPending, rendererOptions]);

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
    },

    // Actions
    actions: {
      row: rowActions,
      bulk: bulkActions,
      global: globalActions,
    },
  };
}