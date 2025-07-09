import type { BulkAction, RowAction } from "../types";

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
        for (const item of items) {
          // For bulk updates, we need to merge with existing item data to preserve all fields
          // This is especially important for "added" items that have full data in pending state
          const entityUpdate = {
            ...item, // Start with the full item
            ...updateData, // Apply the bulk update changes
            id: item.id // Always include the primary key for identification
          } as T;
          
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