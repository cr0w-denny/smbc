import React, { useState, useMemo, useCallback } from "react";
import { useHashQueryParams } from "../hooks";
import type { DataViewConfig, DataViewResult } from "./types";

export function useDataView<T extends Record<string, any>>(
  config: DataViewConfig<T>
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
    options = {},
  } = config;

  // Extract different action types
  const rowActions = actionConfig.row || [];
  const bulkActions = actionConfig.bulk || [];
  const globalActions = actionConfig.global || [];

  // Filter state (URL-synced)
  const defaultFilters = filterSpec?.initialValues || {};
  const [filters, setFilters] = useHashQueryParams(defaultFilters);

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

  // Transform filters if needed
  const transformedFilters = options?.transformFilters ? options.transformFilters(filters) : filters;

  // API Query - This will need to be implemented based on the specific API client
  // For now, we'll create a placeholder that can be overridden
  const {
    data: queryData,
    isLoading,
    error,
  } = api.client.useQuery?.("get", api.endpoint, {
    params: {
      query: {
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        ...transformedFilters,
        ...(options?.apiParams || {}),
      },
    },
  }) || { data: null, isLoading: false, error: null };

  // Extract data and total from query response
  // Handle different API response structures
  const rawData = queryData?.data || queryData?.items || queryData?.users || queryData || [];
  const data = Array.isArray(rawData) ? rawData : [];
  const total = queryData?.total || queryData?.count || data.length;

  // Mutations - Placeholder implementations
  const createMutation = api.client.useMutation?.("post", api.endpoint) || {
    mutate: () => {},
    isPending: false,
  };

  const updateMutation = api.client.useMutation?.("patch", `${api.endpoint}/{id}`) || {
    mutate: () => {},
    isPending: false,
  };

  const deleteMutation = api.client.useMutation?.("delete", `${api.endpoint}/{id}`) || {
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
    await createMutation.mutate({ body: data });
    setCreateDialogOpen(false);
  }, [createMutation]);

  const handleEditSubmit = useCallback(async (data: T) => {
    if (!editingItem) return;
    const primaryKey = schema.primaryKey;
    await updateMutation.mutate({
      params: { path: { id: editingItem[primaryKey] } },
      body: data,
    });
    setEditDialogOpen(false);
    setEditingItem(null);
  }, [updateMutation, editingItem, schema.primaryKey]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    const primaryKey = schema.primaryKey;
    await deleteMutation.mutate({
      params: { path: { id: deletingItem[primaryKey] } },
    });
    setDeleteDialogOpen(false);
    setDeletingItem(null);
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
        columns: renderer.mapColumns ? renderer.mapColumns(columns) : columns,
        actions: rowActions,
        isLoading,
        error,
        selection: {
          enabled: true,
          selectedIds,
          onSelectionChange: setSelectedIds,
        },
        ...options,
      });
  }, [renderer, data, columns, rowActions, isLoading, error, selectedIds, options]);

  const FilterComponent = useMemo(() => {
    if (!filterSpec) return () => null;
    
    return () =>
      React.createElement(renderer.FilterComponent, {
        spec: renderer.mapFilters ? renderer.mapFilters(filterSpec) : filterSpec,
        values: filters,
        onFiltersChange: setFilters,
        ...options,
      });
  }, [renderer, filterSpec, filters, setFilters, options]);

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
        ...options,
      });
  }, [renderer, forms?.create, handleCreateSubmit, createMutation.isPending, options]);

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
        ...options,
      });
  }, [renderer, forms?.edit, handleEditSubmit, updateMutation.isPending, options]);

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
        ...options,
      });
  }, [renderer, pagination.page, pagination.pageSize, total, setPagination, paginationConfig, options]);

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
    },

    // Actions
    actions: {
      row: rowActions,
      bulk: bulkActions,
      global: globalActions,
    },
  };
}