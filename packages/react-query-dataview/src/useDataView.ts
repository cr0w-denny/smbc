import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DataViewConfig, DataViewResult } from "./types";
import { useActivity } from "./activity";
import { SimpleTransactionManager } from "./transaction/TransactionManager";
import type {
  TransactionConfig,
  TransactionOperation,
  OperationTrigger,
} from "./transaction/types";
import { TransactionRegistry } from "./transaction/TransactionRegistry";

export interface UseDataViewOptions {
  /** Transform filter values for query keys and API requests */
  transformFilters?: (filters: any) => any;
  /** Function to determine which columns to show based on current filters */
  getActiveColumns?: (columns: any[], filters: any) => any[];
  /** Optional notification handlers for user feedback */
  onSuccess?: (action: "create" | "edit" | "delete", item?: any) => void;
  onError?: (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => void;
  /** Transaction configuration for batch operations */
  transaction?: TransactionConfig;
  /**
   * External filter state (e.g., from useHashParams or other state management)
   * If provided, useDataView will use this instead of internal state
   */
  filterState?: {
    filters: any;
    setFilters: (updates: any) => void;
  };
  /**
   * External pagination state (e.g., from useHashParams or other state management)
   * If provided, useDataView will use this instead of internal state
   */
  paginationState?: {
    pagination: any;
    setPagination: (updates: any) => void;
  };
}

export function useDataView<T extends Record<string, any>>(
  config: DataViewConfig<T>,
  options: UseDataViewOptions = {},
): DataViewResult<T> {
  console.log("📊 useDataView render", {
    hasExternalFilterState: !!options.filterState,
    hasExternalPaginationState: !!options.paginationState,
  });
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
  const queryClient = useQueryClient();
  console.log("🔍 DataView QueryClient instance:", queryClient);

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
      requireConfirmation: true,
    };

    return new SimpleTransactionManager<T>({
      ...defaultConfig,
      ...options.transaction,
    });
  });

  // Helper function to emit activities
  const emitActivity = useCallback(
    (type: "create" | "update" | "delete", item: T) => {
      if (!activityConfig?.enabled || !activityContext) return;

      const entityType = activityConfig.entityType || "item";
      const label = activityConfig.labelGenerator
        ? activityConfig.labelGenerator(item)
        : typeof schema.displayName === "function"
          ? schema.displayName(item)
          : `${entityType} ${item[schema.primaryKey]}`;
      const url = activityConfig.urlGenerator
        ? activityConfig.urlGenerator(item)
        : undefined;

      activityContext.addActivity({
        type,
        entityType,
        label,
        url,
      });
    },
    [activityConfig, activityContext, schema],
  );

  // State management with optional hash params support
  const defaultFilters = filterSpec?.initialValues || {};
  const defaultPagination = {
    page: 0,
    pageSize: paginationConfig.defaultPageSize || 10,
  };

  // State management: use external state if provided, otherwise fall back to local state
  const [localFilters, setLocalFilters] = useState(defaultFilters);
  const [localPagination, setLocalPagination] = useState(defaultPagination);

  // Use external state if provided, otherwise use local state
  const filters = options.filterState?.filters ?? localFilters;
  const baseSetFilters = options.filterState?.setFilters ?? setLocalFilters;
  const pagination = options.paginationState?.pagination ?? localPagination;
  const setPaginationState =
    options.paginationState?.setPagination ?? setLocalPagination;

  // Selection state (optional)
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Helper to clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Wrap setFilters to clear selection on any filter change
  const setFilters = useCallback(
    (newFilters: any) => {
      // Clear selection on any filter change - changing filters means changing context
      if (selectedIds.length > 0) {
        clearSelection();
      }

      baseSetFilters(newFilters);
    },
    [baseSetFilters, clearSelection, selectedIds.length],
  );

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Extract data and total from query response using configurable functions
  const responseRow =
    api.responseRow ||
    ((response: any) => (Array.isArray(response) ? response : []));
  const responseRowCount =
    api.responseRowCount ||
    ((response: any) =>
      response?.total || response?.count || responseRow(response).length);
  const formatCacheUpdate =
    api.formatCacheUpdate ||
    ((_originalResponse: any, newRows: any[]) => newRows);

  // Transform filters for consistent query keys and API requests
  const transformedFilters = useMemo(() => {
    return options.transformFilters
      ? options.transformFilters(filters)
      : filters;
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
    return ["get", api.endpoint, queryParams];
  }, [
    api.endpoint,
    pagination.page,
    pagination.pageSize,
    transformedFilters,
    config.options?.apiParams,
  ]);

  // Store the current query key in a ref so we can access it without causing effect re-runs
  const currentQueryKeyRef = React.useRef(currentQueryKey);
  React.useEffect(() => {
    currentQueryKeyRef.current = currentQueryKey;
  }, [currentQueryKey]);

  // Helper to update pending states and trigger re-render
  const updatePendingStates = React.useCallback(
    (updater: (map: Map<string | number, any>) => void) => {
      updater(pendingStatesRef.current);
      setPendingStatesVersion((v) => v + 1);
    },
    [],
  );

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
          transactionSnapshot = queryClient.getQueryData(
            currentQueryKeyRef.current,
          );
        }
      };

      const handleTransactionCancelled = () => {
        // Clear pending states Map
        updatePendingStates((map) => map.clear());

        if (transactionSnapshot) {
          // Restore the original snapshot data
          queryClient.setQueryData(
            currentQueryKeyRef.current,
            transactionSnapshot,
          );
        } else {
          // Fallback: Just trigger re-render to remove pending states
          queryClient.setQueryData(currentQueryKeyRef.current, (old: any) => {
            if (!old) return old;
            // Simply return the data - pending states are now cleared from the Map
            return { ...old };
          });
        }
        transactionSnapshot = null;
      };

      const handleTransactionComplete = (results: any[]) => {
        console.log("UseDataView: transaction completing - before clear", {
          pendingStatesCount: pendingStatesRef.current.size,
          pendingStates: Array.from(pendingStatesRef.current.entries()),
          results: results.map((r) => ({
            success: r.success,
            operationType: r.operation?.type,
            entityId: r.operation?.entityId,
            error: r.error,
          })),
        });

        console.log("UseDataView: Transaction results details", results);

        // Clear pending states Map
        updatePendingStates((map) => {
          console.log("UseDataView: Clearing pending states map");
          map.clear();
        });

        // Emit aggregated activities for transaction commit (only if explicitly enabled)
        if (
          activityConfig?.enabled &&
          activityContext &&
          options.transaction?.emitActivities === true
        ) {
          // Group operations by type and success status for bulk activities
          const operationsByType = results.reduce((acc: any, result: any) => {
            if (result.operation) {
              const type = result.operation.type;
              if (!acc[type]) acc[type] = { successful: [], failed: [] };

              if (result.success) {
                acc[type].successful.push(result.operation);
              } else {
                acc[type].failed.push(result.operation);
              }
            }
            return acc;
          }, {});

          // Emit one activity per operation type
          Object.entries(operationsByType).forEach(
            ([type, ops]: [string, any]) => {
              const entityType = activityConfig.entityType || "item";
              const successCount = ops.successful.length;
              const failCount = ops.failed.length;
              const totalCount = successCount + failCount;

              let label: string;
              let url: string | undefined;

              if (totalCount === 1) {
                // Single operation
                const operation = ops.successful[0] || ops.failed[0];
                const status = ops.successful.length > 0 ? "" : " (failed)";
                label = activityConfig.labelGenerator
                  ? activityConfig.labelGenerator(operation.entity) + status
                  : operation.label || `${type} ${entityType}${status}`;
                url =
                  activityConfig.urlGenerator && ops.successful.length > 0
                    ? activityConfig.urlGenerator(operation.entity)
                    : undefined;
              } else {
                // Multiple operations - show success/failure breakdown
                const typeLabel =
                  type === "delete"
                    ? "Deleted"
                    : type === "update"
                      ? "Updated"
                      : "Created";

                if (failCount === 0) {
                  // All successful
                  label = `${typeLabel} ${successCount} ${entityType}${successCount > 1 ? "s" : ""}`;
                } else if (successCount === 0) {
                  // All failed
                  label = `Failed to ${type} ${failCount} ${entityType}${failCount > 1 ? "s" : ""}`;
                } else {
                  // Mixed results
                  label = `${typeLabel} ${successCount} of ${totalCount} ${entityType}${totalCount > 1 ? "s" : ""} (${failCount} failed)`;
                }
                url = undefined;
              }

              activityContext.addActivity({
                type: type as "create" | "update" | "delete",
                entityType,
                label,
                url,
              });
            },
          );
        }

        // Invalidate queries to get fresh data from server
        console.log(
          "UseDataView: About to invalidate queries for endpoint",
          api.endpoint,
        );
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
        console.log("UseDataView: Queries invalidated");

        // Clear selections since the transaction is complete
        clearSelection();

        transactionSnapshot = null;

        console.log("UseDataView: Transaction complete - after clear", {
          pendingStatesCount: pendingStatesRef.current.size,
          pendingStates: Array.from(pendingStatesRef.current.entries()),
        });
      };

      const handleOperationRemoved = (
        operationId: string,
        removedOperation?: any,
      ) => {
        console.log("UseDataView: operation removed", {
          operationId,
          removedOperation: removedOperation
            ? {
                type: removedOperation.type,
                entityId: removedOperation.entityId,
              }
            : null,
          currentPendingStates: Array.from(pendingStatesRef.current.entries()),
        });

        // For operation conflicts, don't remove pending state if it's been updated to a different operation
        // (i.e., when delete gets replaced by update, we keep the update pending state)
        updatePendingStates((map) => {
          if (removedOperation && removedOperation.entityId) {
            const entityId = removedOperation.entityId;
            const currentPendingState = map.get(entityId);

            // Only remove if the current pending state still has the same operation ID as the removed one
            if (
              currentPendingState &&
              currentPendingState.operationId === operationId
            ) {
              console.log(
                "UseDataView: removing pending state for entity (current operation removed)",
                entityId,
              );
              map.delete(entityId);
            } else {
              console.log(
                "UseDataView: keeping pending state - operation already replaced",
                {
                  entityId,
                  removedOperationId: operationId,
                  currentOperationId: currentPendingState?.operationId,
                },
              );
            }
          } else {
            // Fallback: try to match by operationId
            let found = false;
            for (const [entityId, pendingState] of map.entries()) {
              if (pendingState.operationId === operationId) {
                console.log(
                  "UseDataView: removing pending state for entity (by operationId)",
                  entityId,
                );
                map.delete(entityId);
                found = true;
                break;
              }
            }
            if (!found) {
              console.log(
                "UseDataView: operation ID not found in pending states",
                {
                  operationId,
                  currentPendingStates: Array.from(map.entries()),
                },
              );
            }
          }
        });

        // Update cache to trigger re-render
        queryClient.setQueryData(currentQueryKeyRef.current, (old: any) => {
          if (!old) return old;

          const currentRows = responseRow(old);
          let updatedRows: any[];

          if (removedOperation && removedOperation.type === "create") {
            // Remove the newly created item entirely for creates
            const entityId = removedOperation.entityId;
            updatedRows = currentRows.filter(
              (item: any) => item[schema.primaryKey] !== entityId,
            );
          } else {
            // For updates and deletes, just trigger re-render - pending states are already removed from Map
            updatedRows = [...currentRows];
          }

          return formatCacheUpdate(old, updatedRows);
        });
      };

      // Listen to transaction events for rollback
      console.log("UseDataView: Registering transaction event handlers");

      transactionManager.on("onTransactionStart", handleTransactionStart);
      transactionManager.on(
        "onTransactionCancelled",
        handleTransactionCancelled,
      );
      transactionManager.on("onTransactionComplete", handleTransactionComplete);
      transactionManager.on("onOperationRemoved", handleOperationRemoved);

      console.log("UseDataView: Transaction event handlers registered");

      return () => {
        TransactionRegistry.unregister(managerId);
        transactionManager.off("onTransactionStart", handleTransactionStart);
        transactionManager.off(
          "onTransactionCancelled",
          handleTransactionCancelled,
        );
        transactionManager.off(
          "onTransactionComplete",
          handleTransactionComplete,
        );
        transactionManager.off("onOperationRemoved", handleOperationRemoved);
      };
    }
  }, [
    transactionManager,
    queryClient,
    responseRow,
    formatCacheUpdate,
    activityConfig,
    activityContext,
    options.transaction?.emitActivities,
    api.endpoint,
    updatePendingStates,
  ]);

  // Build query parameters for the API request
  const queryParams = {
    params: {
      query: {
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        ...transformedFilters,
        ...(api.apiParams || {}),
      },
    },
  };

  // Debug logging for query parameters
  console.log("UseDataView: Query parameters being sent", {
    queryParams,
    rawFilters: filters,
    transformedFilters,
    pagination,
    selectedIdsLength: selectedIds.length,
  });

  // Track if transaction is active
  const hasActiveTransaction = transactionManager?.hasOperations() || false;

  // Log when transaction state changes
  React.useEffect(() => {
    console.log("UseDataView: Transaction state changed", {
      hasActiveTransaction,
      hasTransactionManager: !!transactionManager,
      operationCount: transactionManager?.hasOperations()
        ? "has ops"
        : "no ops",
      currentQueryKey,
    });

    // Check cache immediately when transaction state changes
    if (hasActiveTransaction) {
      const cachedData = queryClient.getQueryData(currentQueryKey);
      console.log("UseDataView: Cache check on transaction start", {
        hasCachedData: !!cachedData,
        cachedRowCount: cachedData ? responseRow(cachedData).length : 0,
        currentQueryKey,
      });
    }
  }, [hasActiveTransaction, transactionManager, currentQueryKey, queryClient]);

  // Separate pending state tracking - key: entity ID, value: pending state info
  const pendingStatesRef = React.useRef<
    Map<
      string | number,
      {
        state: "added" | "edited" | "deleted";
        operationId: string;
        data?: Partial<T>;
      }
    >
  >(new Map());

  // State to force re-renders when pending states change (since refs don't trigger re-renders)
  const [pendingStatesVersion, setPendingStatesVersion] = React.useState(0);

  // Store the last known good data before transactions
  const lastKnownDataRef = React.useRef(null);

  const {
    data: queryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get", api.endpoint, queryParams],
    queryFn: async () => {
      console.log("UseDataView: Making API request", {
        endpoint: api.endpoint,
        queryParams,
        requestTime: new Date().toISOString(),
      });

      const response = await api.client.GET(api.endpoint as any, queryParams);

      console.log("UseDataView: API response received", {
        hasData: !!response.data,
        hasError: !!response.error,
        dataRowCount: response.data ? responseRow(response.data).length : 0,
        responseTime: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch data");
      }
      return response.data;
    },
    // Keep queries enabled during transactions to allow pagination
    enabled: true,
  });

  // Preserve data when query becomes available
  React.useEffect(() => {
    if (queryData && !hasActiveTransaction) {
      lastKnownDataRef.current = queryData;
      console.log("UseDataView: Preserving query data", {
        rowCount: responseRow(queryData).length,
        hasActiveTransaction,
      });
    }
  }, [queryData, hasActiveTransaction]);

  // During transactions, use preserved data instead of empty cache
  const effectiveData = React.useMemo(() => {
    // If we're loading and don't have query data, return null to show loading state
    if (isLoading && !queryData) {
      console.log("UseDataView: Using loading state (no data while loading)", {
        hasQueryData: !!queryData,
        isLoading,
        hasActiveTransaction,
      });
      return null;
    }

    // Always use fresh query data to allow pagination during transactions
    // Transaction state is preserved separately in pendingStatesRef
    console.log("UseDataView: Using fresh query data", {
      hasQueryData: !!queryData,
      queryRowCount: queryData ? responseRow(queryData).length : 0,
      hasActiveTransaction,
      isLoading,
    });
    return queryData;
  }, [queryData, hasActiveTransaction, isLoading]);

  // Return clean data and transaction state separately - let UI components handle merging
  const rawData = responseRow(effectiveData);
  const data = rawData; // Always return clean data

  console.log("UseDataView: Data being returned to table", {
    dataCount: data.length,
    hasTransactionManager: !!transactionManager,
    transactionHasOperations: transactionManager?.hasOperations(),
    pendingStatesCount: pendingStatesRef.current.size,
    pendingStateKeys: Array.from(pendingStatesRef.current.keys()),
    dataItemIds: data.map((item: T) => item[schema.primaryKey]),
  });

  // Transaction state for UI components to use during rendering
  const transactionState = React.useMemo(() => {
    if (!transactionManager || !transactionManager.hasOperations()) {
      return {
        hasActiveTransaction: false,
        pendingStates: new Map(),
        pendingStatesVersion: 0,
      };
    }

    return {
      hasActiveTransaction: true,
      pendingStates: new Map(pendingStatesRef.current),
      pendingStatesVersion,
    };
  }, [transactionManager, pendingStatesVersion]);

  console.log(
    "UseDataView: Providing separate data and transaction state to UI",
    {
      dataLength: data?.length || 0,
      hasActiveTransaction: transactionState.hasActiveTransaction,
      pendingStatesCount: transactionState.pendingStates.size,
      firstItemId: data?.[0]?.id,
    },
  );

  const total = responseRowCount(effectiveData);

  // Mutations with optimistic updates
  const createMutation = useMutation({
    mutationFn: async (variables: any) => {
      const response = await api.client.POST(api.endpoint as any, variables);
      if (response.error) {
        throw new Error(response.error.message || "Failed to create item");
      }
      return response.data;
    },
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

        // Use formatCacheUpdate to maintain response structure
        return formatCacheUpdate(old, updatedRows);
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: any, _variables: any, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.("create", error);
    },
    onSuccess: (newItem: any) => {
      options.onSuccess?.("create", newItem);
      // Emit activity: always if no transactions, only if transactions don't handle activities
      const shouldEmitActivity =
        !transactionManager || options.transaction?.emitActivities !== true;
      if (shouldEmitActivity) {
        emitActivity("create", newItem);
      }

      // Update the optimistic item with the real server response
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;

        const currentRows = responseRow(old);

        // Replace the temporary item with the real one from server
        const updatedRows = currentRows.map((item: any) => {
          // Find the temporary item and replace it
          if (
            typeof item[schema.primaryKey] === "string" &&
            item[schema.primaryKey].startsWith("temp-")
          ) {
            return { ...newItem }; // Use server response
          }
          return item;
        });

        return formatCacheUpdate(old, updatedRows);
      });

      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (variables: any) => {
      const response = await api.client.PATCH(
        `${api.endpoint}/{id}` as any,
        variables,
      );
      if (response.error) {
        throw new Error(response.error.message || "Failed to update item");
      }
      return response.data;
    },
    onMutate: async (variables: any) => {
      // Skip optimistic updates when in transaction mode
      if (transactionManager) {
        return { previousData: null };
      }

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
          item[primaryKey] === itemId ? { ...item, ...variables.body } : item,
        );

        return formatCacheUpdate(old, updatedRows);
      });

      return { previousData };
    },
    onError: (error: any, variables: any, context: any) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.("edit", error, variables.body);
    },
    onSuccess: (_data: any, variables: any) => {
      options.onSuccess?.("edit", variables.body);
      // Emit activity: always if no transactions, only if transactions don't handle activities
      const shouldEmitActivity =
        !transactionManager || options.transaction?.emitActivities !== true;
      if (shouldEmitActivity) {
        emitActivity("update", variables.body);
      }
      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (variables: any) => {
      const response = await api.client.DELETE(
        `${api.endpoint}/{id}` as any,
        variables,
      );
      if (response.error) {
        throw new Error(response.error.message || "Failed to delete item");
      }
      return response.data;
    },
    onMutate: async (variables: any) => {
      console.log("UseDataView: Delete mutation onMutate start", {
        itemId: variables.params?.path?.id,
        hasTransactionManager: !!transactionManager,
        deletingItem: deletingItem?.id,
        currentQueryKey,
      });

      // Skip optimistic updates when in transaction mode
      if (transactionManager) {
        console.log("UseDataView: Skipping optimistic delete - in transaction mode");
        return { previousData: null };
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: currentQueryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(currentQueryKey);
      console.log("UseDataView: Previous data snapshot", {
        rowCount: previousData ? responseRow(previousData).length : 0,
      });

      // Optimistically remove the item from cache
      queryClient.setQueryData(currentQueryKey, (old: any) => {
        if (!old) return old;

        const currentRows = responseRow(old);
        const primaryKey = schema.primaryKey;
        const itemId = variables.params?.path?.id;

        console.log("UseDataView: Before optimistic removal", {
          currentRowCount: currentRows.length,
          removingItemId: itemId,
          primaryKey,
        });

        const filteredRows = currentRows.filter(
          (item: T) => item[primaryKey] !== itemId,
        );

        console.log("UseDataView: After optimistic removal", {
          newRowCount: filteredRows.length,
          removedCount: currentRows.length - filteredRows.length,
        });

        return formatCacheUpdate(old, filteredRows);
      });

      const result = { previousData, deletedItem: deletingItem };
      console.log("UseDataView: Delete mutation onMutate end", result);
      return result;
    },
    onError: (error: any, _variables: any, context: any) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      options.onError?.("delete", error, context?.deletedItem);
    },
    onSuccess: (_data: any, _variables: any, context: any) => {
      options.onSuccess?.("delete", context?.deletedItem);
      // Emit activity: always if no transactions, only if transactions don't handle activities
      const shouldEmitActivity =
        !transactionManager || options.transaction?.emitActivities !== true;
      if (context?.deletedItem && shouldEmitActivity) {
        emitActivity("delete", context.deletedItem);
      }
      // Only invalidate when not in transaction mode to avoid overwriting optimistic updates
      if (!transactionManager) {
        queryClient.invalidateQueries({
          queryKey: ["get", api.endpoint],
          exact: false,
        });
      }
    },
  });

  // Helper function to get accumulated pending data for an entity
  const getPendingData = useCallback(
    (entityId: string | number) => {
      if (!transactionManager || !transactionManager.hasOperations()) {
        return null;
      }

      const pendingState = pendingStatesRef.current.get(entityId);
      console.log("UseDataView: getPendingData called", {
        entityId,
        pendingState: pendingState
          ? {
              state: pendingState.state,
              operationId: pendingState.operationId,
              data: pendingState.data,
            }
          : null,
      });

      return pendingState?.data || null;
    },
    [transactionManager],
  );

  // Helper function to add operations to transaction
  const addTransactionOperation = useCallback(
    async (
      type: "create" | "update" | "delete",
      entity: T,
      mutation: () => Promise<any>,
      trigger: OperationTrigger = "user-edit",
      changedFields?: string[],
    ) => {
      console.log("UseDataView: Add transaction operation start", {
        type,
        entityId: entity[schema.primaryKey],
        trigger,
        hasTransactionManager: !!transactionManager,
        existingOperations: transactionManager?.hasOperations(),
      });

      if (!transactionManager) {
        console.log(
          "UseDataView: No transaction manager, executing immediately",
        );
        // No transaction manager, execute immediately
        return mutation();
      }

      // Start transaction if this is the first operation (captures snapshot for rollback)
      if (!transactionManager.hasOperations()) {
        console.log("UseDataView: Starting new transaction");
        transactionManager.begin();
      }

      // Generate a consistent operation ID that will be used for both the transaction and visual state
      const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const primaryKey = schema.primaryKey;
      const entityId = entity[primaryKey];

      // Check for deleting an added item
      if (type === "delete") {
        const existingState = pendingStatesRef.current.get(entityId);
        if (existingState?.state === "added") {
          console.log("🔴 UseDataView: marking added item as deleted for consistent UX", {
            entityId,
            existingState,
            allPendingStates: Array.from(pendingStatesRef.current.entries()),
          });
          // Mark as deleted in pending states instead of removing entirely
          updatePendingStates((map) => {
            console.log("🔴 UseDataView: Before setting deleted state", {
              entityId,
              currentSize: map.size,
              currentKeys: Array.from(map.keys()),
            });
            map.set(entityId, {
              state: "deleted" as const,
              operationId: operationId, // Use the NEW delete operation ID, not the old create operation ID
              data: existingState.data, // Keep the original data for display
            });
            console.log("🔴 UseDataView: After setting deleted state", {
              entityId,
              newSize: map.size,
              newKeys: Array.from(map.keys()),
              newState: map.get(entityId),
            });
          });
          // Remove from selectedIds if it was selected
          setSelectedIds(prev => {
            const newSelectedIds = prev.filter(id => id !== entityId);
            console.log("UseDataView: removing deleted item from selectedIds", {
              entityId,
              prevSelectedIds: prev,
              newSelectedIds,
            });
            return newSelectedIds;
          });
          // Don't remove the operation from transaction manager - let it handle the create->delete conversion
          // The TransactionManager will handle this by marking it with wasCreated metadata
          
          // We need to still add the delete operation to the TransactionManager, but skip the normal pending state update
          // since we've already handled it above and want to preserve the data
          const entityType = activityConfig?.entityType || "item";
          const label = activityConfig?.labelGenerator
            ? activityConfig.labelGenerator(entity)
            : `${type} ${entityType}`;

          const operation = {
            type,
            trigger,
            entity: entity as T,
            entityId: entity[schema.primaryKey],
            originalData: existingState.data as T | undefined,
            changedFields,
            label,
            mutation,
            color: "error" as const,
          };

          return transactionManager.addOperation(operation, operationId);
        }
      }

      console.log("UseDataView: Generated operation", {
        operationId,
        entityId,
        primaryKey,
      });

      // Store pending state in separate Map structure
      updatePendingStates((map) => {
        console.log("UseDataView: Updating pending states", {
          type,
          entityId,
          operationId,
          currentMapSize: map.size,
          currentKeys: Array.from(map.keys()),
        });
        console.log("UseDataView: Adding pending state", {
          type,
          entityId,
          existingState: map.get(entityId),
          newOperationId: operationId,
        });

        if (type === "create") {
          // For creates, we need a temp ID
          const tempId = entityId || `temp-${Date.now()}`;
          map.set(tempId, {
            state: "added",
            operationId,
            data: entity,
          });
        } else {
          // For updates and deletes, use the actual entity ID
          // Check if there's an existing pending state that should be overridden
          const existingState = map.get(entityId);

          if (type === "update" && existingState?.state === "deleted") {
            // If we're updating a deleted item, check if it was originally created
            const wasOriginallyCreated = typeof entityId === 'string' && entityId.startsWith('temp_');
            const newState = wasOriginallyCreated ? "added" : "edited";
            console.log(
              "UseDataView: converting deleted item back to", newState, "for entity",
              entityId, { wasOriginallyCreated }
            );
            map.set(entityId, {
              state: newState,
              operationId,
              data: entity,
            });
          } else {
            // For updates, merge with existing pending data to accumulate changes
            let mergedData = entity;
            if (
              type === "update" &&
              existingState &&
              (existingState.state === "edited" || existingState.state === "added") &&
              existingState.data
            ) {
              // For subsequent updates, merge the new entity data with existing pending data
              // Both entity and existingState.data should be full objects, so merge them
              mergedData = {
                ...existingState.data,
                ...entity,
              };

              console.log("UseDataView: accumulating changes for entity", {
                entityId,
                existingState: existingState.state,
                existingData: existingState.data,
                newData: entity,
                mergedData,
              });
            }

            map.set(entityId, {
              state:
                type === "update"
                  ? existingState?.state === "added"
                    ? "added"
                    : "edited"
                  : "deleted",
              operationId,
              data: type === "update" ? mergedData : undefined,
            });
          }
        }
      });

      // Only update cache for creates - updates/deletes use pending states only
      if (type === "create") {
        queryClient.setQueryData(currentQueryKeyRef.current, (old: any) => {
          if (!old) return old;

          const currentRows = responseRow(old);
          const tempId = entityId || `temp-${Date.now()}`;
          const pendingItem = {
            ...entity,
            [primaryKey]: tempId,
            createdAt: new Date().toISOString(),
          };
          const updatedRows = [pendingItem, ...currentRows];

          return formatCacheUpdate(old, updatedRows);
        });
      }
      // For updates and deletes, pending states will trigger re-render via pendingStatesVersion

      const entityType = activityConfig?.entityType || "item";
      const label = activityConfig?.labelGenerator
        ? activityConfig.labelGenerator(entity)
        : `${type} ${entityType}`;

      // Store original data for rollback
      const previousData = queryClient.getQueryData(currentQueryKeyRef.current);
      const originalItem = previousData
        ? responseRow(previousData).find(
            (item: T) => item[schema.primaryKey] === entity[schema.primaryKey],
          )
        : undefined;

      // Clean entity data before storing in transaction (no metadata to remove anymore)
      const operation: Omit<TransactionOperation<T>, "id" | "timestamp"> = {
        type,
        trigger,
        entity: entity as T,
        entityId: entity[schema.primaryKey],
        originalData: originalItem,
        changedFields,
        label,
        mutation,
        color:
          type === "create"
            ? "success"
            : type === "update"
              ? "primary"
              : "error",
      };

      return transactionManager.addOperation(operation, operationId);
    },
    [
      transactionManager,
      activityConfig,
      schema,
      queryClient,
      responseRow,
      formatCacheUpdate,
      updatePendingStates,
    ],
  );

  // Helper to update pagination
  const setPagination = useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      setPaginationState((prev: any) => ({
        ...prev,
        ...updates,
      }));
    },
    [setPaginationState],
  );

  // Action handlers
  const handleCreate = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  // Helper to merge pending changes into an item
  const getMergedItem = useCallback(
    (item: T) => {
      if (!transactionManager || !transactionManager.hasOperations()) {
        return item;
      }

      const primaryKey = schema.primaryKey;
      const entityId = item[primaryKey];
      const pendingState = pendingStatesRef.current.get(entityId);

      if (pendingState?.state === "edited" && pendingState.data) {
        return { ...item, ...pendingState.data };
      }

      return item;
    },
    [transactionManager, schema.primaryKey],
  );

  const handleEdit = useCallback(
    (item: T) => {
      // Store the merged item (with pending changes) for the edit form
      const mergedItem = getMergedItem(item);
      setEditingItem(mergedItem);
      setEditDialogOpen(true);
    },
    [getMergedItem],
  );

  const handleDelete = useCallback(
    async (item: T) => {
      setDeletingItem(item);
      // If transaction mode is enabled, skip the dialog and delete directly
      if (transactionManager) {
        const primaryKey = schema.primaryKey;
        try {
          await addTransactionOperation(
            "delete",
            item,
            () =>
              deleteMutation.mutateAsync({
                params: { path: { id: item[primaryKey] } },
              }),
            "user-edit",
          );
        } catch (error) {
          // Error is handled by mutation onError callback
        }
      } else {
        setDeleteDialogOpen(true);
      }
    },
    [
      transactionManager,
      schema.primaryKey,
      addTransactionOperation,
      deleteMutation,
    ],
  );

  const handleCreateSubmit = useCallback(
    async (data: Partial<T>) => {
      const tempEntity = {
        ...data,
        [schema.primaryKey]: `temp_${Date.now()}`,
      } as T;

      try {
        await addTransactionOperation(
          "create",
          tempEntity,
          () => createMutation.mutateAsync({ body: data }),
          "user-edit",
        );
        setCreateDialogOpen(false);
      } catch (error) {
        // Error is handled by mutation onError callback
      }
    },
    [createMutation, addTransactionOperation, schema.primaryKey],
  );

  const handleEditSubmit = useCallback(
    async (data: T) => {
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
          "update",
          updatedEntity,
          () =>
            updateMutation.mutateAsync({
              params: { path: { id: editingItem[primaryKey] } },
              body: data,
            }),
          "user-edit",
        );
        setEditDialogOpen(false);
        setEditingItem(null);
      } catch (error) {
        // Error is handled by mutation onError callback
        // Keep dialog open so user can retry
      }
    },
    [updateMutation, editingItem, schema.primaryKey, addTransactionOperation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    const primaryKey = schema.primaryKey;
    try {
      await addTransactionOperation(
        "delete",
        deletingItem,
        () =>
          deleteMutation.mutateAsync({
            params: { path: { id: deletingItem[primaryKey] } },
          }),
        "user-edit",
      );
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      // Error is handled by mutation onError callback
      // Keep dialog open so user can retry
    }
  }, [
    deleteMutation,
    deletingItem,
    schema.primaryKey,
    addTransactionOperation,
  ]);

  // Selection helpers
  const selectedItems = useMemo(() => {
    const primaryKey = schema.primaryKey;

    // First, get selected items from the regular data, but merge with pending changes
    const selectedFromData = data.filter((item: T) =>
      selectedIds.includes(item[primaryKey]),
    ).map((item: T) => {
      // Check if this item has pending changes and merge them
      const entityId = item[primaryKey];
      const pendingState = pendingStatesRef.current?.get(entityId);
      
      if (pendingState?.state === "edited" && pendingState.data) {
        // Merge pending changes with the original item
        const mergedItem = {
          ...item,
          ...pendingState.data,
        } as T;
        
        console.log('UseDataView: Merging pending changes for selectedItem', {
          entityId,
          originalItem: item,
          pendingData: pendingState.data,
          mergedItem
        });
        
        return mergedItem;
      }
      
      return item;
    });

    // Then, get selected items from pending states (for newly created items)
    const selectedFromPending: T[] = [];
    if (transactionManager && pendingStatesRef.current) {
      for (const [entityId, stateInfo] of pendingStatesRef.current) {
        if (
          selectedIds.includes(entityId) &&
          stateInfo.state === "added" &&
          stateInfo.data
        ) {
          // Only include if not already in regular data
          if (!selectedFromData.some((item) => item[primaryKey] === entityId)) {
            selectedFromPending.push({
              ...stateInfo.data,
              [primaryKey]: entityId,
            } as T);
          }
        }
      }
    }

    const allSelectedItems = [...selectedFromData, ...selectedFromPending];
    
    // Clean up selectedIds to remove IDs that don't correspond to actual items
    // This is important for cases where items are deleted (including net zero deletions)
    const validSelectedIds = allSelectedItems.map(item => item[primaryKey] as string | number);
    const invalidSelectedIds = selectedIds.filter(id => !validSelectedIds.includes(id));
    
    if (invalidSelectedIds.length > 0) {
      console.log('UseDataView: Cleaning up invalid selected IDs', {
        invalidSelectedIds,
        validSelectedIds,
        currentSelectedIds: selectedIds,
        dataCount: data.length,
        pendingStatesCount: pendingStatesRef.current.size,
        allSelectedItemsCount: allSelectedItems.length
      });
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        setSelectedIds(validSelectedIds);
      }, 0);
    }

    return allSelectedItems;
  }, [
    data,
    selectedIds,
    schema.primaryKey,
    transactionManager,
    pendingStatesRef,
    setSelectedIds,
  ]);

  // Pre-configured components
  const TableComponent = useMemo(() => {
    const Component = renderer.TableComponent;
    return () =>
      React.createElement(Component, {
        data,
        columns: activeColumns,
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
  }, [
    renderer,
    data,
    activeColumns,
    rowActions,
    isLoading,
    error,
    selectedIds,
    rendererOptions,
  ]);

  const FilterComponent = useMemo(() => {
    if (!filterSpec) return () => null;

    return () =>
      React.createElement(renderer.FilterComponent, {
        spec: filterSpec,
        values: filters,
        onFiltersChange: setFilters,
        ...rendererOptions,
      });
  }, [renderer, filterSpec, setFilters, rendererOptions]); // Removed filters from dependencies

  const CreateFormComponent = useMemo(() => {
    const createForm = forms?.create;
    if (!createForm) return () => null;

    const entityType = activityConfig?.entityType || "Item";

    return () =>
      React.createElement(renderer.FormComponent, {
        mode: "create",
        fields: createForm.fields,
        onSubmit: handleCreateSubmit,
        onCancel: () => setCreateDialogOpen(false),
        isSubmitting: createMutation.isPending,
        entityType,
        ...rendererOptions,
      });
  }, [
    renderer,
    forms?.create,
    handleCreateSubmit,
    createMutation.isPending,
    rendererOptions,
    activityConfig?.entityType,
  ]);

  const EditFormComponent = useMemo(() => {
    const editForm = forms?.edit;
    if (!editForm) return () => null;

    const entityType = activityConfig?.entityType || "Item";

    return ({ item }: { item: T }) =>
      React.createElement(renderer.FormComponent, {
        mode: "edit",
        fields: editForm.fields,
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
  }, [
    renderer,
    forms?.edit,
    handleEditSubmit,
    updateMutation.isPending,
    rendererOptions,
    activityConfig?.entityType,
  ]);

  const PaginationComponent = useMemo(() => {
    if (!paginationConfig.enabled) return () => null;

    return () =>
      React.createElement(renderer.PaginationComponent, {
        page: pagination.page ?? 0,
        pageSize:
          pagination.pageSize ?? (paginationConfig.defaultPageSize || 10),
        total,
        onPageChange: (page: number) => {
          console.log("useDataView: setPagination called for page change", {
            page,
            currentPagination: pagination,
          });
          setPagination({ page });
        },
        onPageSizeChange: (pageSize: number) => {
          console.log(
            "useDataView: setPagination called for page size change",
            { pageSize, currentPagination: pagination },
          );
          setPagination({ pageSize, page: 0 });
        },
        pageSizeOptions: paginationConfig.pageSizeOptions,
        ...rendererOptions,
      });
  }, [
    renderer,
    pagination.page,
    pagination.pageSize,
    total,
    setPagination,
    paginationConfig,
    rendererOptions,
  ]);

  return {
    // Data (always clean, no pending states merged)
    data,
    isLoading,
    error,
    total,

    // Transaction state (separate from data)
    transactionState,

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
    getPendingData,
  };
}
