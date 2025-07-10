import type { BulkAction, RowAction } from "../types";
import { useQueryClient } from "@tanstack/react-query";

// Context that gets passed to action onClick handlers
interface ActionContext {
  addTransactionOperation?: (
    type: "create" | "update" | "delete",
    entity: any,
    mutation: () => Promise<any>,
    trigger?: "user-edit" | "bulk-action" | "row-action",
    changedFields?: string[]
  ) => string;
  getPendingData?: (entityId: string | number) => any;
  deleteMutation?: {
    mutateAsync: (params: { params: { path: { id: string | number } } }) => Promise<any>;
  };
  updateMutation?: {
    mutateAsync: (params: { params: { path: { id: string | number } }; body: any }) => Promise<any>;
  };
  createMutation?: {
    mutateAsync: (params: { body: any }) => Promise<any>;
  };
  // Optimistic update context
  queryClient?: ReturnType<typeof useQueryClient>;
  dataViewQueryKey?: unknown[];
  optimisticMode?: boolean;
}

/**
 * Helper function to create a bulk delete action
 */
export function createBulkDeleteAction<T extends { id: string | number }>(
  deleteAPI: (id: string | number) => Promise<any>,
  options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
  }
): BulkAction<T> {
  return {
    type: "bulk",
    key: options?.key || "delete-selected",
    label: options?.label || "Delete Selected",
    icon: options?.icon,
    color: "error",
    onClick: async (items: T[], context?: ActionContext) => {
      console.log('BulkDeleteHelper: Starting bulk delete operation', {
        itemCount: items.length,
        itemIds: items.map(i => i.id),
        hasTransactionOperation: !!context?.addTransactionOperation,
        hasDeleteMutation: !!context?.deleteMutation,
        contextKeys: context ? Object.keys(context) : []
      });

      if (context?.addTransactionOperation) {
        console.log('BulkDeleteHelper: Using transaction system for bulk delete');
        // Use transaction system - this handles pending states correctly
        for (const item of items) {
          console.log('BulkDeleteHelper: Adding transaction operation for item', item.id);
          context.addTransactionOperation(
            "delete",
            item,
            async () => {
              console.log('BulkDeleteHelper: Transaction mutation executing for item', item.id);
              // Use the framework's delete mutation instead of direct API call
              // This ensures proper integration with the transaction system
              if (context.deleteMutation) {
                console.log('BulkDeleteHelper: Calling deleteMutation.mutateAsync for item', item.id);
                await context.deleteMutation.mutateAsync({
                  params: { path: { id: item.id } },
                });
                console.log('BulkDeleteHelper: deleteMutation.mutateAsync completed for item', item.id);
              } else {
                console.log('BulkDeleteHelper: No deleteMutation, falling back to direct API for item', item.id);
                // Fallback to direct API call if mutation not available
                await deleteAPI(item.id);
              }
              console.log('BulkDeleteHelper: Transaction mutation function completed for item', item.id);
              return {};
            },
            "bulk-action"
          );
        }
        console.log('BulkDeleteHelper: All transaction operations added');
      } else {
        console.log('BulkDeleteHelper: No transaction support, using direct API calls');
        // No transaction support, use direct API calls
        for (const item of items) {
          console.log('BulkDeleteHelper: Direct API call for item', item.id);
          await deleteAPI(item.id);
        }
      }
      console.log('BulkDeleteHelper: Bulk delete operation completed');
    },
  } as BulkAction<T>;
}

/**
 * Helper function to create a bulk update action
 */
export function createBulkUpdateAction<T extends { id: string | number }>(
  updateAPI: (id: string | number, data: Partial<T>) => Promise<any>,
  updateData: Partial<T>,
  options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  }
): BulkAction<T> {
  return {
    type: "bulk",
    key: options?.key || `update-${Object.keys(updateData)[0]}`,
    label: options?.label || "Update Selected",
    icon: options?.icon,
    color: options?.color || "primary",
    onClick: async (items: T[], context?: ActionContext) => {
      if (context?.addTransactionOperation) {
        console.log('BulkUpdateHelper: Starting bulk update', {
          itemCount: items.length,
          updateData,
          items: items.map(item => ({ ...item }))
        });
        
        for (const item of items) {
          // For bulk updates, we need to merge with existing item data to preserve all fields
          // This is especially important for "added" items that have full data in pending state
          const entityUpdate = {
            ...item, // Start with the full item
            ...updateData, // Apply the bulk update changes
          } as T;
          
          console.log('BulkUpdateHelper: Processing item', {
            itemId: item.id,
            originalItem: item,
            updateData,
            entityUpdate
          });
          
          context.addTransactionOperation(
            "update",
            entityUpdate,
            () => {
              console.log('BulkUpdateHelper: mutation executing', {
                itemId: item.id,
                updateData
              });
              
              // Get the accumulated pending data at execution time
              const accumulatedData = context?.getPendingData?.(item.id);
              const dataToApply = accumulatedData || updateData;
              
              console.log('BulkUpdateHelper: applying accumulated data', {
                itemId: item.id,
                originalUpdateData: updateData,
                accumulatedData,
                dataToApply
              });
              
              const result = updateAPI(item.id, dataToApply);
              console.log('BulkUpdateHelper: mutation result', result);
              return result;
            },
            "bulk-action",
            Object.keys(updateData)
          );
        }
      }
    },
  } as BulkAction<T>;
}

/**
 * Helper function to create a row update action
 */
export function createRowUpdateAction<T extends { id: string | number }>(
  updateAPI: (id: string | number, data: Partial<T>) => Promise<any>,
  getUpdateData: (item: T) => Partial<T>,
  options: {
    key: string;
    label: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
  }
): RowAction<T> {
  return {
    type: "row",
    key: options.key,
    label: options.label,
    icon: options.icon,
    color: options.color || "primary",
    disabled: options.disabled,
    hidden: options.hidden,
    onClick: async (item: T, context?: ActionContext) => {
      if (context?.addTransactionOperation) {
        const updateData = getUpdateData(item);
        const updatedItem = { ...item, ...updateData };
        context.addTransactionOperation(
          "update",
          updatedItem,
          () => updateAPI(item.id, updateData),
          "row-action",
          Object.keys(updateData)
        );
      }
    },
  } as RowAction<T>;
}

/**
 * Helper function to create a row delete action
 */
export function createRowDeleteAction<T extends { id: string | number }>(
  deleteAPI: (id: string | number) => Promise<any>,
  options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
  }
): RowAction<T> {
  return {
    type: "row",
    key: options?.key || "delete",
    label: options?.label || "Delete",
    icon: options?.icon,
    color: "error",
    disabled: options?.disabled,
    hidden: options?.hidden,
    onClick: async (item: T, context?: ActionContext) => {
      if (context?.addTransactionOperation) {
        context.addTransactionOperation(
          "delete",
          item,
          async () => {
            await deleteAPI(item.id);
            return {};
          },
          "row-action"
        );
      }
    },
  } as RowAction<T>;
}

/**
 * Helper function to create a toggle status action
 */
export function createToggleStatusAction<T extends { id: string | number }>(
  updateAPI: (id: string | number, data: Partial<T>) => Promise<any>,
  statusField: keyof T,
  statusValues: [any, any], // [activeValue, inactiveValue]
  options: {
    key: string;
    label: string;
    icon?: React.ComponentType;
    getLabel?: (item: T) => string; // Dynamic label based on current status
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
  }
): RowAction<T> {
  return {
    type: "row",
    key: options.key,
    label: options.label,
    icon: options.icon,
    color: "primary",
    disabled: options.disabled,
    hidden: options.hidden,
    onClick: async (item: T, context?: ActionContext) => {
      if (context?.addTransactionOperation) {
        const currentValue = item[statusField];
        const newValue = currentValue === statusValues[0] ? statusValues[1] : statusValues[0];
        const updateData = { [statusField]: newValue } as Partial<T>;
        const updatedItem = { ...item, ...updateData };
        
        context.addTransactionOperation(
          "update",
          updatedItem,
          () => updateAPI(item.id, updateData),
          "row-action",
          [statusField as string]
        );
      }
    },
  } as RowAction<T>;
}

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

/**
 * Helper function to create an optimistic bulk update action
 * Handles all the complexity of optimistic updates, failure tracking, and rollback
 */
export function createOptimisticBulkUpdateAction<T extends { id: string | number }>(
  apiCall: (item: T, updateData: Partial<T>) => Promise<any>,
  optimisticUpdate: (item: T) => Partial<T>,
  options: {
    key: string;
    label: string;
    icon?: React.ComponentType;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    appliesTo?: (item: T) => boolean;
    requiresAllRows?: boolean;
  }
): BulkAction<T> {
  return {
    type: "bulk",
    key: options.key,
    label: options.label,
    icon: options.icon,
    color: options.color || "primary",
    appliesTo: options.appliesTo,
    requiresAllRows: options.requiresAllRows,
    onClick: async (items: T[], context?: ActionContext) => {
      console.log(`🚀 OptimisticBulkUpdate: Starting ${options.key}`, {
        itemCount: items.length,
        optimisticMode: context?.optimisticMode,
        hasQueryClient: !!context?.queryClient,
        hasDataViewQueryKey: !!context?.dataViewQueryKey,
        queryKey: context?.dataViewQueryKey,
        context: context ? Object.keys(context) : 'no context'
      });

      // If optimistic mode is enabled and we have the necessary context
      if (context?.optimisticMode && context?.queryClient && context?.dataViewQueryKey) {
        const { queryClient, dataViewQueryKey } = context;

        // 1. Apply optimistic updates immediately
        console.log("🚀 Applying optimistic updates");
        console.log("🔑 Using query key:", dataViewQueryKey);
        console.log("🔑 Available cache keys:", 
          queryClient.getQueryCache().getAll().map(q => ({
            key: q.queryKey,
            hasData: !!q.state.data
          }))
        );
        
        queryClient.setQueryData(dataViewQueryKey, (oldData: any) => {
          console.log("🚀 Cache update - oldData:", oldData);
          if (!oldData) return oldData;

          // For product catalog, the data structure is { products: [...], total: number, page: number, pageSize: number }
          const currentRows = oldData.products || [];
          const updatedItems = currentRows.map((item: T) => {
            const selectedItem = items.find(selected => selected.id === item.id);
            if (selectedItem) {
              const updates = optimisticUpdate(selectedItem);
              console.log("🚀 Updating item", item.id, "with", updates);
              return { ...item, ...updates };
            }
            return item;
          });

          const newData = {
            ...oldData,
            products: updatedItems
          };
          console.log("🚀 Cache update - newData:", newData);
          return newData;
        });

        // 2. Execute API calls and track failures
        const failedItems: T[] = [];
        for (const item of items) {
          try {
            const updateData = optimisticUpdate(item);
            await apiCall(item, updateData);
            console.log(`✅ API success for ${item.id}`);
          } catch (error) {
            console.error(`❌ API failed for ${item.id}:`, error);
            failedItems.push(item);
          }
        }

        // 3. Rollback only failed items
        if (failedItems.length > 0) {
          console.log(`🔄 Rolling back ${failedItems.length} failed items`);
          queryClient.setQueryData(dataViewQueryKey, (oldData: any) => {
            if (!oldData) return oldData;

            const currentRows = oldData.products || [];
            const revertedItems = currentRows.map((item: T) => {
              const failedItem = failedItems.find(failed => failed.id === item.id);
              if (failedItem) {
                console.log("🔄 Reverting item", item.id, "back to original state");
                // Revert to original state
                return failedItem;
              }
              return item;
            });

            const newData = {
              ...oldData,
              products: revertedItems
            };
            console.log("🔄 Cache rollback - newData:", newData);
            return newData;
          });
        }

        console.log(`🚀 OptimisticBulkUpdate completed: ${items.length - failedItems.length} succeeded, ${failedItems.length} failed`);
      } else {
        // Fallback to transaction mode or direct API calls
        console.log("🚀 Fallback to transaction/direct mode");
        if (context?.addTransactionOperation) {
          for (const item of items) {
            const updateData = optimisticUpdate(item);
            const updatedItem = { ...item, ...updateData };
            context.addTransactionOperation(
              "update",
              updatedItem,
              () => apiCall(item, updateData),
              "bulk-action",
              Object.keys(updateData)
            );
          }
        } else {
          // Direct API calls without optimistic updates
          for (const item of items) {
            const updateData = optimisticUpdate(item);
            await apiCall(item, updateData);
          }
        }
      }
    },
  } as BulkAction<T>;
}

/**
 * Helper function to create an optimistic bulk delete action
 */
export function createOptimisticBulkDeleteAction<T extends { id: string | number }>(
  deleteAPI: (id: string | number) => Promise<any>,
  options?: {
    key?: string;
    label?: string;
    icon?: React.ComponentType;
    appliesTo?: (item: T) => boolean;
    requiresAllRows?: boolean;
  }
): BulkAction<T> {
  return {
    type: "bulk",
    key: options?.key || "delete-selected",
    label: options?.label || "Delete Selected",
    icon: options?.icon,
    color: "error",
    appliesTo: options?.appliesTo,
    requiresAllRows: options?.requiresAllRows,
    onClick: async (items: T[], context?: ActionContext) => {
      console.log(`🗑️ OptimisticBulkDelete: Starting`, {
        itemCount: items.length,
        optimisticMode: context?.optimisticMode
      });

      // If optimistic mode is enabled and we have the necessary context
      if (context?.optimisticMode && context?.queryClient && context?.dataViewQueryKey) {
        const { queryClient, dataViewQueryKey } = context;

        // 1. Apply optimistic delete immediately
        console.log("🗑️ Applying optimistic deletes");
        const originalData = queryClient.getQueryData(dataViewQueryKey) as any;
        queryClient.setQueryData(dataViewQueryKey, (oldData: any) => {
          if (!oldData) return oldData;

          const currentRows = Array.isArray(oldData) ? oldData : (oldData.products || oldData.data || []);
          const filteredItems = currentRows.filter((item: T) => 
            !items.find(deleted => deleted.id === item.id)
          );

          // Reconstruct response preserving original structure
          if (Array.isArray(oldData)) {
            return filteredItems;
          } else {
            return {
              ...oldData,
              products: oldData.products ? filteredItems : undefined,
              data: oldData.data ? filteredItems : undefined,
              total: Math.max(0, (oldData.total || 0) - items.length),
              // Fallback: if neither products nor data, assume it's the main field
              ...((!oldData.products && !oldData.data) ? filteredItems : {})
            };
          }
        });

        // 2. Execute API calls and track failures
        const failedItems: T[] = [];
        for (const item of items) {
          try {
            await deleteAPI(item.id);
            console.log(`✅ Delete API success for ${item.id}`);
          } catch (error) {
            console.error(`❌ Delete API failed for ${item.id}:`, error);
            failedItems.push(item);
          }
        }

        // 3. Restore failed deletions
        if (failedItems.length > 0) {
          console.log(`🔄 Restoring ${failedItems.length} failed deletions`);
          queryClient.setQueryData(dataViewQueryKey, (oldData: any) => {
            if (!oldData || !originalData) return oldData;

            // Get current rows and original rows using consistent pattern
            const currentRows = Array.isArray(oldData) ? oldData : (oldData.products || oldData.data || []);
            const originalRows = Array.isArray(originalData) ? originalData : (originalData.products || originalData.data || []);
            
            // Add back the failed items in their original positions
            const restoredItems = [...currentRows];
            for (const failedItem of failedItems) {
              const originalIndex = originalRows.findIndex((item: T) => item.id === failedItem.id);
              if (originalIndex !== -1) {
                restoredItems.splice(originalIndex, 0, failedItem);
              } else {
                restoredItems.push(failedItem);
              }
            }

            // Reconstruct response preserving original structure
            if (Array.isArray(oldData)) {
              return restoredItems;
            } else {
              return {
                ...oldData,
                products: oldData.products ? restoredItems : undefined,
                data: oldData.data ? restoredItems : undefined,
                total: (oldData.total || 0) + failedItems.length,
                // Fallback: if neither products nor data, assume it's the main field
                ...((!oldData.products && !oldData.data) ? restoredItems : {})
              };
            }
          });
        }

        console.log(`🗑️ OptimisticBulkDelete completed: ${items.length - failedItems.length} succeeded, ${failedItems.length} failed`);
      } else {
        // Fallback to existing bulk delete logic
        return createBulkDeleteAction(deleteAPI, options).onClick?.(items, context);
      }
    },
  } as BulkAction<T>;
}