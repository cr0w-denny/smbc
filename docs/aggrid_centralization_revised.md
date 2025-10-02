# AG Grid Centralization - Revised Approach

## Simple API Design

Instead of multiple utilities and factories, expose a **single function** that accepts any AG Grid configuration and returns it merged with sensible defaults.

### Core Philosophy

- **Minimal API surface** - One function: `gridOptions()`
- **Full flexibility** - Accepts any AgGridReact props
- **Smart defaults** - Common patterns built-in but easily overridden
- **Zero boilerplate** - Just pass what you need, get everything configured

---

## Implementation

### File: `packages/mui-components/src/ag-grid/gridOptions.ts`

```typescript
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
    menuTabs: ['filterMenuTab', 'columnsMenuTab'],
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
    headerHeight: 54,
    enableBrowserTooltips: true,
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
```

### Export from mui-components

```typescript
// packages/mui-components/src/index.ts
export { gridOptions } from './ag-grid/gridOptions';
```

---

## Usage Examples

### Example 1: Simple Grid

```typescript
import { gridOptions } from '@smbc/mui-components';

<AgGridReact
  {...gridOptions({
    rowData: obligors,
    columnDefs: columns,
    rowSelection: 'multiple',
  })}
/>
```

### Example 2: Override Defaults

```typescript
<AgGridReact
  {...gridOptions({
    rowData: events,
    columnDefs: columns,
    headerHeight: 60,  // Override default 54
    defaultColDef: {
      // Override specific defaultColDef props
      menuTabs: ['filterMenuTab'],  // Remove columnsMenuTab
    },
  })}
/>
```

### Example 3: Master-Detail Grid

```typescript
<AgGridReact
  {...gridOptions({
    rowData: events,
    columnDefs: columns,
    rowSelection: 'multiple',
    masterDetail: true,
    detailCellRenderer: DetailRenderer,
    detailRowHeight: 200,
    getRowStyle: (params) => {
      if (params.node.expanded) {
        return { backgroundColor: ui.tableRow.on.hover.background };
      }
      return undefined;
    },
  })}
/>
```

### Example 4: Completely Custom

```typescript
// gridOptions() doesn't prevent any customization
<AgGridReact
  {...gridOptions({
    rowData: data,
    columnDefs: columns,
    // ANY AG Grid prop works - nothing is hidden
    suppressMovableColumns: true,
    enableRangeSelection: true,
    pagination: true,
    paginationPageSize: 50,
    onCellClicked: handleCellClick,
    // etc...
  })}
/>
```

---

## Benefits of This Approach

### 1. **Minimal API Surface**
- Learn one function: `gridOptions()`
- No need to remember multiple helpers/factories
- Less documentation to maintain

### 2. **Maximum Flexibility**
- Pass ANY AgGridReact prop
- Override ANY default
- No limitations or "you can't do X because we abstracted it"

### 3. **Progressive Enhancement**
- Start simple: `gridOptions({ rowData, columnDefs })`
- Add complexity as needed: just pass more props
- TypeScript guides you with full AG Grid types

### 4. **Zero Magic**
- Everything is explicit
- Easy to debug - just look at what you passed
- No hidden behavior or special cases

### 5. **Easy Migration**
- Existing code: `<AgGridReact rowData={data} columnDefs={cols} sortable filter />`
- New code: `<AgGridReact {...gridOptions({ rowData: data, columnDefs: cols })} />`
- Gradual adoption - no all-or-nothing commitment

---

## What About Column Factories?

Keep them as **optional** convenience helpers, not requirements:

```typescript
// packages/mui-components/src/ag-grid/columns.ts

import type { ColDef } from 'ag-grid-community';

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
```

**Usage** (optional - use if you want convenience):

```typescript
import { gridOptions, checkboxColumn, actionsColumn } from '@smbc/mui-components';

const columns: ColDef[] = [
  checkboxColumn(),
  { field: 'name', headerName: 'Name' },
  { field: 'date', headerName: 'Date' },
  actionsColumn<Event>([
    { label: 'Edit', onClick: (item) => edit(item) },
    { label: 'Delete', onClick: (item) => delete(item) },
  ]),
];

<AgGridReact {...gridOptions({ rowData, columnDefs: columns })} />
```

---

## Complete Example: Before & After

### Before (ewi-events - 680 lines)

```typescript
const gridRef = React.useRef<AgGridReact>(null);

<AgGridReact
  ref={gridRef}
  headerHeight={54}
  enableBrowserTooltips={true}
  popupParent={popupParent}
  rowData={filteredEvents}
  columnDefs={columnDefs}
  rowSelection="multiple"
  onSelectionChanged={onSelectionChanged}
  loading={isLoading}
  animateRows
  suppressCellFocus
  suppressRowClickSelection
  cellSelection={false}
  suppressHorizontalScroll={false}
  alwaysShowHorizontalScroll={false}
  masterDetail
  detailCellRenderer={DetailCellRenderer}
  detailRowHeight={200}
  isRowMaster={(_dataItem) => true}
  getRowStyle={(params) => {
    if (params.node.expanded) {
      return { backgroundColor: ui.tableRow.on.hover.background };
    }
    if (params.node.detail) {
      return { backgroundColor: ui.tableRow.on.selected.background };
    }
    return undefined;
  }}
  defaultColDef={{
    filter: true,
    sortable: true,
    resizable: true,
    menuTabs: ["filterMenuTab"],
  }}
  sortingOrder={["asc", "desc"]}
  multiSortKey={"ctrl"}
  columnMenu="legacy"
/>
```

### After

```typescript
<AgGridReact
  ref={gridRef}
  {...gridOptions({
    popupParent,
    rowData: filteredEvents,
    columnDefs,
    rowSelection: 'multiple',
    onSelectionChanged,
    loading: isLoading,
    masterDetail: true,
    detailCellRenderer: DetailCellRenderer,
    detailRowHeight: 200,
    isRowMaster: () => true,
    getRowStyle: (params) => {
      if (params.node.expanded) {
        return { backgroundColor: ui.tableRow.on.hover.background };
      }
      if (params.node.detail) {
        return { backgroundColor: ui.tableRow.on.selected.background };
      }
      return undefined;
    },
    defaultColDef: {
      menuTabs: ['filterMenuTab'],  // Override default
    },
    sortingOrder: ['asc', 'desc'],
    multiSortKey: 'ctrl',
  })}
/>
```

**Result**:
- Removed ~15 lines of boilerplate
- All defaults applied automatically
- Still have full control
- More readable - only the important parts

---

## Comparison to Original Plan

### Original Plan (❌ Too Complex)
- Multiple factories: `createCheckboxColumn()`, `createActionsColumn()`, `createExpandColumn()`
- Multiple hooks: `useAgGridRef()`, `useAgGridSelection()`, `useMasterDetail()`
- Multiple utilities: `DEFAULT_COL_DEF`, `getCommonGridProps()`, formatters
- **Result**: ~10 different exports to learn and remember

### Revised Plan (✅ Simple)
- **One main function**: `gridOptions()`
- **Optional helpers**: `checkboxColumn()`, `actionsColumn()`, `expandColumn()`
- **Optional utilities**: Value formatters if needed
- **Result**: Learn one function, use helpers if you want convenience

---

## Implementation Plan

### Phase 1: Core (1 day)
1. Create `gridOptions()` function
2. Export from mui-components
3. Write tests
4. Update 1 applet as proof of concept

### Phase 2: Optional Helpers (1 day)
1. Create column helper functions (checkbox, actions, expand)
2. Create value formatter utilities
3. Export from mui-components

### Phase 3: Migration (2-3 days)
1. Migrate ewi-obligor (simplest)
2. Migrate reports (add AgGridTheme while at it)
3. Migrate usage-stats
4. Migrate ewi-events (most complex)

### Phase 4: Documentation (1 day)
1. Document `gridOptions()` with examples
2. Document optional helpers
3. Create migration guide
4. Update CLAUDE.md

---

## Final API

```typescript
// Core (required)
export function gridOptions(options?: Partial<AgGridReactProps>): AgGridReactProps;

// Helpers (optional convenience)
export function checkboxColumn(overrides?: Partial<ColDef>): ColDef;
export function expandColumn(overrides?: Partial<ColDef>): ColDef;
export function actionsColumn<T>(menuItems, overrides?: Partial<ColDef>): ColDef;

// Formatters (optional convenience)
export function formatIsoDate(params: ValueFormatterParams): string;
export function formatLocalDate(params: ValueFormatterParams): string;
```

**That's it.** Simple, flexible, powerful.
