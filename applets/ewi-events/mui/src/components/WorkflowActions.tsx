import React from "react";

interface BulkAction<T = any> {
  type: "bulk";
  key: string;
  label: string;
  icon?: React.ComponentType;
  color?: "primary" | "secondary" | "success" | "error" | "warning";
  onClick?: (selectedItems: T[]) => void;
  disabled?: (selectedItems: T[]) => boolean;
  hidden?: (selectedItems: T[]) => boolean;
  appliesTo?: (item: T) => boolean;
  requiresAllRows?: boolean;
}

interface GlobalAction {
  type: "global";
  key: string;
  label: string;
  icon?: React.ComponentType;
  onClick?: () => void;
}

export interface WorkflowActionsProps<T = any> {
  /** Global actions (right side) */
  globalActions?: GlobalAction[];
  /** Bulk actions (available for workflow dropdown) */
  bulkActions: BulkAction<T>[];
  /** Currently selected items */
  selectedItems: T[];
  /** Total number of items */
  totalItems?: number;
  /** Callback when selection is cleared */
  onClearSelection?: () => void;
  /** Transaction state for bulk action visibility calculations */
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<
      string | number,
      {
        state: "added" | "edited" | "deleted";
        operationId: string;
        data?: Partial<T>;
      }
    >;
    pendingStatesVersion: number;
  };
  /** Primary key field name for transaction state lookups */
  primaryKey?: keyof T;
  /** Callback to update workflow dropdown with bulk actions */
  onWorkflowActionsChange?: (
    actions: BulkAction<T>[],
    selectedItems: T[],
  ) => void;
}

/**
 * WorkflowActions component that integrates bulk actions with the workflow dropdown
 * instead of showing a separate action bar
 */
export function WorkflowActions<T = any>({
  globalActions: _globalActions = [],
  bulkActions,
  selectedItems,
  totalItems: _totalItems = 0,
  onClearSelection: _onClearSelection,
  transactionState,
  primaryKey = "id" as keyof T,
  onWorkflowActionsChange,
}: WorkflowActionsProps<T>) {
  // Helper function to get effective item state for visibility calculations
  const getEffectiveItem = (item: T) => {
    if (
      !transactionState?.hasActiveTransaction ||
      !transactionState.pendingStates.size
    ) {
      return item;
    }

    const entityId = item[primaryKey] as string | number;
    const pendingState = transactionState.pendingStates.get(entityId);

    if (pendingState?.state === "added" && pendingState.data) {
      return { ...item, ...pendingState.data };
    } else if (pendingState?.state === "edited" && pendingState.data) {
      return { ...item, ...pendingState.data };
    } else if (pendingState?.state === "deleted") {
      return { ...item, __pendingDelete: true } as T;
    }

    return item;
  };

  // Filter bulk actions based on selection and applicability
  const availableBulkActions = React.useMemo(() => {
    return bulkActions.filter((action) => {
      const effectiveItems = selectedItems.map(getEffectiveItem);

      if (action.hidden?.(effectiveItems)) return false;

      if (action.appliesTo) {
        if (action.requiresAllRows) {
          return effectiveItems.every((item) => action.appliesTo!(item));
        } else {
          return effectiveItems.some((item) => action.appliesTo!(item));
        }
      }

      return true;
    });
  }, [bulkActions, selectedItems, transactionState, primaryKey]);

  // Notify parent once when workflow actions are available
  React.useEffect(() => {
    if (onWorkflowActionsChange && availableBulkActions.length >= 0) {
      onWorkflowActionsChange(availableBulkActions, selectedItems);
    }
  }, [availableBulkActions.length, selectedItems.length]); // Only depend on lengths to prevent loops

  return null;
}
