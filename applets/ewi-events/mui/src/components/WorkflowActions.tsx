import React from "react";
import { BulkAction, GlobalAction } from "@smbc/dataview";

export interface WorkflowActionsProps<T> {
  /** Global actions (right side) */
  globalActions: GlobalAction[];
  /** Bulk actions (available for workflow dropdown) */
  bulkActions: BulkAction<T>[];
  /** Currently selected items */
  selectedItems: T[];
  /** Total number of items */
  totalItems: number;
  /** Callback when selection is cleared */
  onClearSelection: () => void;
  /** Transaction state for bulk action visibility calculations */
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  };
  /** Primary key field name for transaction state lookups */
  primaryKey?: keyof T;
  /** Callback to update workflow dropdown with bulk actions */
  onWorkflowActionsChange?: (actions: BulkAction<T>[], selectedItems: T[]) => void;
}

/**
 * WorkflowActions component that integrates bulk actions with the workflow dropdown
 * instead of showing a separate action bar
 */
export function WorkflowActions<T>({
  globalActions: _globalActions,
  bulkActions,
  selectedItems,
  totalItems: _totalItems,
  onClearSelection: _onClearSelection,
  transactionState,
  primaryKey = 'id' as keyof T,
  onWorkflowActionsChange,
}: WorkflowActionsProps<T>) {

  // Helper function to get effective item state for visibility calculations
  const getEffectiveItem = (item: T) => {
    if (!transactionState?.hasActiveTransaction || !transactionState.pendingStates.size) {
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

  // Note: Global actions are not used since we return null

  // Notify parent once when workflow actions are available (stable)
  React.useEffect(() => {
    if (onWorkflowActionsChange && availableBulkActions.length >= 0) {
      onWorkflowActionsChange(availableBulkActions, selectedItems);
    }
  }, [availableBulkActions.length, selectedItems.length]); // Only depend on lengths to prevent loops

  // Return nothing - all functionality is handled through workflow dropdown
  return null;
}