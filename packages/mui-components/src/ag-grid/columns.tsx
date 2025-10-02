import { Box } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import { ActionMenu } from '../ActionMenu';
import type { ActionMenuItem } from '../ActionMenu';

/**
 * Optional convenience: Creates a checkbox selection column.
 * Just a shorthand - you can always define it manually.
 */
export function checkboxColumn(overrides?: Partial<ColDef>): ColDef {
  return {
    field: 'checkbox',
    headerName: '',
    maxWidth: 50,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    sortable: false,
    filter: false,
    pinned: 'left',
    resizable: false,
    lockPosition: true,
    suppressColumnsToolPanel: true,
    ...overrides,
  };
}

/**
 * Optional convenience: Creates an expand/collapse column for master-detail.
 */
export function expandColumn(overrides?: Partial<ColDef>): ColDef {
  return {
    cellRenderer: 'agGroupCellRenderer',
    headerName: '',
    width: 60,
    minWidth: 60,
    cellRendererParams: { innerRenderer: () => '' },
    pinned: 'left',
    lockPosition: true,
    sortable: false,
    filter: false,
    cellClass: 'expand-cell',
    suppressColumnsToolPanel: true,
    ...overrides,
  };
}

/**
 * Optional convenience: Creates an actions column with ActionMenu.
 */
export function actionsColumn<T = any>(
  menuItems: ActionMenuItem<T>[] | ((item: T) => ActionMenuItem<T>[]),
  overrides?: Partial<ColDef>
): ColDef {
  const cellRenderer = (params: any) => {
    if (!params.data) return null;
    const items = typeof menuItems === 'function' ? menuItems(params.data) : menuItems;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ActionMenu<T>
          menuItems={items}
          item={params.data}
          stopPropagation={true}
          ariaLabel="More Actions"
        />
      </Box>
    );
  };

  return {
    field: 'actions',
    headerName: '',
    maxWidth: 50,
    sortable: false,
    filter: false,
    cellRenderer,
    pinned: 'right',
    resizable: false,
    cellClass: 'actions-cell',
    suppressColumnsToolPanel: true,
    ...overrides,
  };
}
