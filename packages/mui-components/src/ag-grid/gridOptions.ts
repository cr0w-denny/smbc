import type { AgGridReactProps } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

/**
 * Smart defaults for AG Grid that can be overridden.
 * Pass any AgGridReact props - they'll be merged with defaults.
 *
 * @example
 * ```tsx
 * <AgGridReact
 *   {...gridOptions({
 *     rowData: events,
 *     columnDefs: columns,
 *     rowSelection: 'multiple',
 *   })}
 * />
 * ```
 */
export function gridOptions(
  options: Partial<AgGridReactProps> = {}
): AgGridReactProps {
  const {
    defaultColDef = {},
    rowSelection,
    ...rest
  } = options;

  // Smart defaults for defaultColDef
  const mergedDefaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    menuTabs: ['filterMenuTab'],
    ...defaultColDef,
  };

  // Smart defaults for grid behavior
  const baseDefaults: Partial<AgGridReactProps> = {
    animateRows: true,
    suppressCellFocus: true,
    cellSelection: false,
    suppressHorizontalScroll: false,
    alwaysShowHorizontalScroll: false,
    columnMenu: 'legacy',
    pagination: false,
  };

  // If selection enabled, add selection-specific defaults
  if (rowSelection) {
    baseDefaults.suppressRowClickSelection = true;
  }

  return {
    ...baseDefaults,
    ...rest,
    defaultColDef: mergedDefaultColDef,
    rowSelection,
  } as AgGridReactProps;
}
