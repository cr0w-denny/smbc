import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { GridOptions, ColDef, SelectionChangedEvent } from 'ag-grid-community';
import type { DataViewTableProps, RowAction } from '@smbc/react-query-dataview';
import type { AgGridConfig } from '../types';
import { mapDataColumnToColDef, mergeWithTransactionState, getRowStyle } from '../utils';
import { ActionsRenderer } from './ActionsRenderer';

// AG-Grid CSS is imported at the app level

export function AgGridTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  isLoading,
  error,
  onRowClick,
  selection,
  transactionState,
  primaryKey = 'id' as keyof T,
  hover = true,
  rendererConfig,
}: DataViewTableProps<T, AgGridConfig>) {
  
  // Merge data with transaction state
  const displayData = useMemo(() => 
    mergeWithTransactionState(data, transactionState, primaryKey),
    [data, transactionState, primaryKey]
  );

  // Convert columns to AG-Grid column definitions
  const columnDefs = useMemo((): ColDef[] => {
    const baseColDefs = columns.map(mapDataColumnToColDef);
    
    // Add actions column if actions exist
    if (actions && actions.length > 0) {
      const actionsColDef: ColDef = {
        field: '__actions',
        headerName: 'Actions',
        cellRenderer: ActionsRenderer,
        cellRendererParams: { actions, onRowClick },
        sortable: false,
        filter: false,
        resizable: false,
        width: actions.length * 50 + 20,
        pinned: 'right',
      };
      baseColDefs.push(actionsColDef);
    }

    // Apply custom column transformation if provided
    return rendererConfig?.customColumnDefs 
      ? rendererConfig.customColumnDefs(baseColDefs)
      : baseColDefs;
  }, [columns, actions, onRowClick, rendererConfig]);

  // Handle selection changes
  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (!selection) return;
    
    const selectedRows = event.api.getSelectedRows();
    const selectedIds = selectedRows.map(row => row[primaryKey]);
    selection.onSelectionChange(selectedIds);
  }, [selection, primaryKey]);

  // Build grid options
  const gridOptions = useMemo((): GridOptions => {
    const baseOptions: GridOptions = {
      rowData: displayData,
      columnDefs,
      
      // Selection
      rowSelection: selection ? 'multiple' : undefined,
      rowMultiSelectWithClick: selection ? true : undefined,
      suppressRowClickSelection: selection ? false : true,
      
      // Styling
      getRowStyle: (params) => getRowStyle(params, transactionState, primaryKey),
      
      // Performance
      animateRows: true,
      suppressColumnVirtualisation: false,
      
      // Default settings
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        ...rendererConfig?.defaultColDef,
      },
      
      // Events
      onSelectionChanged,
      onRowClicked: onRowClick ? (event) => onRowClick(event.data) : undefined,
      
      // Loading
      loading: isLoading,
      
      // Sidebar
      sideBar: rendererConfig?.showSidebar ? {
        toolPanels: rendererConfig.sidebarConfig?.toolPanels || ['columns', 'filters'],
        defaultToolPanel: rendererConfig.sidebarConfig?.defaultToolPanel,
      } : false,
      
      // Advanced features
      enableRangeSelection: true,
      enableCharts: false, // Requires enterprise
      
      // Export
      ...(rendererConfig?.enableCsvExport && {
        defaultCsvExportParams: {
          fileName: 'data-export.csv',
        }
      }),
    };

    // Merge with user-provided options
    return {
      ...baseOptions,
      ...rendererConfig?.gridOptions,
    };
  }, [
    displayData,
    columnDefs,
    selection,
    transactionState,
    primaryKey,
    onSelectionChanged,
    onRowClick,
    isLoading,
    rendererConfig,
  ]);

  // Update selection when external selection changes
  React.useEffect(() => {
    if (!selection || !gridOptions.api) return;
    
    // This would need to be handled after grid is ready
    // AG-Grid provides onGridReady callback for this
  }, [selection?.selectedIds, gridOptions.api]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading data: {error.message}
      </div>
    );
  }

  const theme = rendererConfig?.theme || 'ag-theme-alpine';

  return (
    <div className={theme} style={{ height: '600px', width: '100%' }}>
      <AgGridReact {...gridOptions} />
    </div>
  );
}