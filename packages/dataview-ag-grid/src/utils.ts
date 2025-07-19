import type { ColDef } from 'ag-grid-community';
import type { DataColumn } from '@smbc/dataview';

/**
 * Maps DataColumn to AG-Grid ColDef
 */
export function mapDataColumnToColDef<T>(column: DataColumn<T>): ColDef {
  return {
    field: column.key,
    headerName: column.label,
    sortable: column.sortable ?? true,
    filter: column.filterable ?? true,
    resizable: true,
    width: typeof column.width === 'number' ? column.width : undefined,
    minWidth: typeof column.width === 'string' ? undefined : 100,
    cellRenderer: column.render ? (params: any) => {
      // Convert AG-Grid params to our render function format
      const rendered = column.render!(params.data);
      
      // Handle React elements
      if (typeof rendered === 'object' && rendered !== null) {
        // For React elements, we need to return a string or handle differently
        // This is a limitation - AG-Grid expects strings/DOM elements
        return rendered;
      }
      
      return rendered;
    } : undefined,
  };
}

/**
 * Merges transaction state with current data for display
 */
export function mergeWithTransactionState<T>(
  data: T[],
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  },
  primaryKey: keyof T = 'id' as keyof T
): T[] {
  if (!transactionState?.hasActiveTransaction) {
    return data;
  }

  const result = [...data];
  
  // Apply pending changes
  transactionState.pendingStates.forEach((pendingState, id) => {
    const index = result.findIndex(item => item[primaryKey] === id);
    
    switch (pendingState.state) {
      case 'added':
        if (pendingState.data && index === -1) {
          result.push(pendingState.data as T);
        }
        break;
      case 'edited':
        if (index !== -1 && pendingState.data) {
          result[index] = { ...result[index], ...pendingState.data };
        }
        break;
      case 'deleted':
        if (index !== -1) {
          result.splice(index, 1);
        }
        break;
    }
  });

  return result;
}

/**
 * Get row styling based on transaction state
 */
export function getRowStyle<T>(
  params: any,
  transactionState?: {
    hasActiveTransaction: boolean;
    pendingStates: Map<string | number, {
      state: "added" | "edited" | "deleted";
      operationId: string;
      data?: Partial<T>;
    }>;
    pendingStatesVersion: number;
  },
  primaryKey: keyof T = 'id' as keyof T
): any {
  if (!transactionState?.hasActiveTransaction || !params.data) {
    return {};
  }

  const id = params.data[primaryKey];
  const pendingState = transactionState.pendingStates.get(id);

  if (!pendingState) {
    return {};
  }

  switch (pendingState.state) {
    case 'added':
      return { backgroundColor: '#d4edda' }; // Light green
    case 'edited':
      return { backgroundColor: '#fff3cd' }; // Light yellow
    case 'deleted':
      return { backgroundColor: '#f8d7da', opacity: 0.7 }; // Light red
    default:
      return {};
  }
}