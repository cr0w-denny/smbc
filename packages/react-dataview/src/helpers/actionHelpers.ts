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
      if (context?.addTransactionOperation) {
        for (const item of items) {
          context.addTransactionOperation(
            "delete",
            item,
            async () => {
              await deleteAPI(item.id);
              return {};
            },
            "bulk-action"
          );
        }
      }
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
          const updatedItem = { ...item, ...updateData };
          context.addTransactionOperation(
            "update",
            updatedItem,
            () => updateAPI(item.id, updateData),
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