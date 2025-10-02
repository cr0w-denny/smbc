# AG Grid Centralization Analysis

## Executive Summary

This analysis examines all AG Grid usage across the codebase to identify opportunities for centralization and code reuse. The codebase currently has:
- **4 direct AG Grid implementations** (ewi-events, usage-stats, ewi-obligor, reports)
- **1 existing abstraction layer** (dataview-ag-grid package)
- **1 shared theme wrapper** (AgGridTheme in mui-components)
- **Significant code duplication** in cell renderers, column definitions, and configuration

**Key Finding**: While a dataview-ag-grid abstraction exists, the majority of implementations don't use it. There are clear patterns of duplicate code that can be centralized similar to the ActionMenu component.

---

## Current AG Grid Usage Locations

### 1. `/Users/developer/ws-cr0w/zzz/applets/ewi-events/mui/src/components/Events.tsx` (680 lines)
**Most Complex Implementation**
- Master-detail expandable rows
- Custom cell renderers (Status, Actions, Detail)
- Row selection with bulk actions
- Advanced filtering with ActionBar and FilterBar
- Custom row styling for expanded/detail rows
- Uses AgGridTheme wrapper

### 2. `/Users/developer/ws-cr0w/zzz/applets/usage-stats/mui/src/Applet.tsx` (372 lines)
**Dynamic Configuration Pattern**
- Dynamic column definitions based on filter.group
- Master-detail with API-driven detail data
- External filtering logic
- Uses AgGridTheme wrapper

### 3. `/Users/developer/ws-cr0w/zzz/applets/ewi-obligor/mui/src/components/Grid.tsx` (225 lines)
**Simplest Implementation**
- Basic grid with checkbox selection
- Embedded in Card component with toolbar
- Chip toggle filtering
- Uses AgGridTheme wrapper

### 4. `/Users/developer/ws-cr0w/zzz/applets/reports/mui/src/Applet.tsx` (289 lines)
**Minimal Implementation**
- Simple grid with pagination
- Custom status cell renderer (inline hardcoded colors)
- No AgGridTheme wrapper (older implementation?)

### 5. `/Users/developer/ws-cr0w/zzz/packages/dataview-ag-grid/` (Existing Abstraction)
**Dataview Framework Integration**
- AgGridTable component with transaction state support
- ActionsRenderer for row actions
- Column mapping utilities
- NOT being used by the applet implementations above

---

## Common Patterns Identified

### 1. **Default Column Definitions** (Used in all implementations)

**Pattern**: All implementations define similar `defaultColDef` props

```typescript
// ewi-events/Events.tsx (lines 662-667)
defaultColDef={{
  filter: true,
  sortable: true,
  resizable: true,
  menuTabs: ["filterMenuTab"],
}}

// ewi-obligor/Grid.tsx (lines 212-216)
defaultColDef={{
  filter: true,
  sortable: true,
  resizable: true,
  menuTabs: ["filterMenuTab", "columnsMenuTab"],
}}

// reports/Applet.tsx (lines 273-277)
defaultColDef={{
  sortable: true,
  filter: true,
  resizable: true,
}}

// usage-stats/Applet.tsx (passed via gridOptions, not directly)
// dataview-ag-grid/AgGridTable.tsx (lines 85-90)
defaultColDef: {
  sortable: true,
  filter: true,
  resizable: true,
  ...rendererConfig?.defaultColDef,
}
```

**Opportunity**: Create a shared `DEFAULT_COL_DEF` constant with optional overrides.

---

### 2. **Checkbox Selection Column** (Used in 2+ implementations)

**Pattern**: Identical checkbox column configuration

```typescript
// ewi-events/Events.tsx (lines 294-306)
{
  field: "checkbox",
  headerName: "",
  maxWidth: 30,
  checkboxSelection: true,
  headerCheckboxSelection: true,
  sortable: false,
  filter: false,
  pinned: "left",
  resizable: false,
  lockPosition: true,
  suppressColumnsToolPanel: true,
}

// ewi-obligor/Grid.tsx (lines 76-87) - nearly identical, maxWidth: 50
{
  field: "checkbox",
  headerName: "",
  maxWidth: 50,
  checkboxSelection: true,
  headerCheckboxSelection: true,
  sortable: false,
  filter: false,
  pinned: "left",
  resizable: false,
  suppressColumnsToolPanel: true,
}
```

**Opportunity**: Create a `createCheckboxColumn(options?)` factory function.

---

### 3. **Actions Column with ActionMenu** (Used in ewi-events)

**Pattern**: Actions column using the centralized ActionMenu component

```typescript
// ewi-events/Events.tsx (lines 182-231, 407-417)
const createActionsCellRenderer = (navigate: (path: string) => void) => (params: any) => {
  const menuItems: ActionMenuItem<Event>[] = [
    {
      label: "Show Details",
      icon: <ListIcon fontSize="small" />,
      href: `#/events/detail?id=${params.data.id}`,
      onClick: (item, event) => { /* navigation logic */ },
      component: "a",
    },
    // ... more items
  ];

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <ActionMenu<Event>
        menuItems={menuItems}
        item={params.data}
        stopPropagation={true}
        ariaLabel="More Actions"
      />
    </Box>
  );
};

// In column definitions:
{
  field: "actions",
  headerName: "",
  maxWidth: 50,
  sortable: false,
  filter: false,
  cellRenderer: ActionsCellRenderer,
  pinned: "right",
  resizable: false,
  cellClass: "actions-cell",
  suppressColumnsToolPanel: true,
}
```

**Opportunity**: Create a `createActionsColumn(menuItems)` factory that returns both the column def and renderer.

---

### 4. **Status Chip Cell Renderer** (Used in ewi-events)

**Pattern**: Status rendering with StatusChip component

```typescript
// ewi-events/Events.tsx (lines 89-179)
const StatusCellRenderer = (params: any) => {
  const theme = useTheme();

  const getVariant = (status: string) => {
    const statusMap = {
      "on-course": "success" as const,
      "almost-due": "warning" as const,
      "past-due": "error" as const,
      "needs-attention": "custom" as const,
    };
    return statusMap[status as keyof typeof statusMap] || ("default" as const);
  };

  if (!params.value) {
    return <StatusChip variant="default" label="UNKNOWN" sx={{...}} size="small" />;
  }

  const variant = getVariant(params.value);
  const label = params.value
    .replace("-", " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  // Special handling for custom variant
  if (variant === "custom") {
    return <StatusChip variant="custom" label={label} {...customProps} />;
  }

  return <StatusChip variant={variant} label={label} sx={{...}} size="small" />;
};
```

**Compared to**: reports/Applet.tsx has inline hardcoded colors (lines 48-79)

**Opportunity**: Create a reusable `createStatusCellRenderer(statusMap)` factory.

---

### 5. **Master-Detail Configuration** (Used in 2 implementations)

**Pattern**: Master-detail setup with similar structure

```typescript
// ewi-events/Events.tsx (lines 642-660)
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

// usage-stats/Applet.tsx (lines 226-295)
masterDetail={["UI", "USER"].includes(filters.group)}
detailCellRenderer={["UI", "USER"].includes(filters.group) ? "agDetailCellRenderer" : undefined}
detailCellRendererParams={{
  getDetailRowData: (params: any) => {
    // API call logic
  },
  detailGridOptions: { ... },
  detailRowHeight: 200,
}}
```

**Opportunity**: Create a `useMasterDetail(config)` hook or `createMasterDetailConfig(options)` helper.

---

### 6. **Grid Reference and Event Handlers** (Used in all implementations)

**Pattern**: Similar grid ref setup and event handlers

```typescript
// All implementations follow this pattern:
const gridRef = React.useRef<AgGridReact>(null);

const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
  const selectedNodes = event.api.getSelectedNodes();
  const selectedData = selectedNodes.map((node) => node.data);
  setSelectedRows(selectedData);
}, []);

// Common operations on gridRef:
gridRef.current?.api.deselectAll();
gridRef.current?.api.showColumnChooser();
gridRef.current?.api.setFilterModel(null);
```

**Opportunity**: Create a `useAgGridRef()` hook that provides typed API helpers.

---

### 7. **Common Grid Props** (Used in all implementations)

**Pattern**: Similar base props across grids

```typescript
// Common across implementations:
<AgGridReact
  ref={gridRef}
  rowData={data}
  columnDefs={columnDefs}
  rowSelection="multiple" // when selection enabled
  loading={isLoading}
  animateRows
  suppressCellFocus
  suppressRowClickSelection
  cellSelection={false}
  suppressHorizontalScroll={false}
  alwaysShowHorizontalScroll={false}
  columnMenu="legacy"
  headerHeight={54} // varies: 54, 50
  enableBrowserTooltips={true} // in ewi-events
  popupParent={popupParent} // from AgGridTheme
  defaultColDef={{ ... }}
/>
```

**Opportunity**: Create a `useAgGridProps(options)` hook that returns common props with overrides.

---

### 8. **AgGridTheme Wrapper Usage** (Used in 3/4 implementations)

**Pattern**: Consistent wrapper with theme integration

```typescript
// ewi-events, usage-stats, ewi-obligor all use:
<AgGridTheme height="92%">
  {(popupParent) => (
    <AgGridReact
      ref={gridRef}
      popupParent={popupParent}
      {...otherProps}
    />
  )}
</AgGridTheme>

// reports applet does NOT use AgGridTheme (older implementation?)
```

**Good**: AgGridTheme is already centralized in mui-components
**Opportunity**: Ensure all implementations use it consistently

---

### 9. **Date Formatting** (Pattern appears in multiple places)

**Pattern**: Common date value formatters

```typescript
// ewi-events/Events.tsx (line 328)
valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---")

// ewi-obligor/Grid.tsx (lines 129-130)
valueFormatter: ({ value }) =>
  value ? new Date(value).toLocaleDateString() : "---"
```

**Opportunity**: Create common value formatter utilities.

---

### 10. **Expand/Collapse Column** (Used in ewi-events)

**Pattern**: Master-detail expand column

```typescript
// ewi-events/Events.tsx (lines 307-322)
{
  cellRenderer: "agGroupCellRenderer",
  headerName: "",
  width: 60,
  minWidth: 60,
  cellRendererParams: {
    innerRenderer: () => "",
  },
  pinned: "left",
  lockPosition: true,
  sortable: false,
  filter: false,
  cellClass: "expand-cell",
  suppressColumnsToolPanel: true,
}
```

**Opportunity**: Create a `createExpandColumn(options?)` factory function.

---

## Duplicate Code Analysis

### High Duplication Areas

1. **Default Column Definitions** - 100% duplication across 4 implementations
   - Lines saved: ~15 per implementation = **60 lines**

2. **Checkbox Column Configuration** - 95% similar in 2 implementations
   - Lines saved: ~12 per implementation = **24 lines**

3. **Actions Column Setup** - Custom logic in each place that uses it
   - Lines saved: ~30 in ewi-events alone
   - Potential: **30-60 lines** if pattern spreads

4. **Status Cell Renderer** - Inline hardcoded in reports vs StatusChip in ewi-events
   - Lines saved: ~90 in ewi-events, ~30 in reports = **120 lines**

5. **Grid Reference Management** - Boilerplate in every implementation
   - Lines saved: ~10 per implementation = **40 lines**

6. **Common Grid Props** - Repeated in every implementation
   - Lines saved: ~15 per implementation = **60 lines**

7. **Selection Handler Logic** - Nearly identical across implementations
   - Lines saved: ~8 per implementation = **32 lines**

8. **Value Formatters** - Date formatting repeated
   - Lines saved: ~5 per occurrence = **15 lines**

**Total Estimated Line Reduction**: ~441 lines of duplicate code
**Maintenance Improvement**: Changes to common patterns require updates in 1 place instead of 4

---

## Existing Centralization

### Already Centralized (Good!)

1. **AgGridTheme Component** (`/packages/mui-components/src/AgGridTheme.tsx`)
   - Theme integration (light/dark mode)
   - Token-based styling via CSS variables
   - Popup parent management
   - Header wrapping support
   - Used in 3/4 implementations
   - **Status**: Well-designed, should be used everywhere

2. **dataview-ag-grid Package** (`/packages/dataview-ag-grid/`)
   - AgGridTable component
   - ActionsRenderer
   - Column mapping utilities (mapDataColumnToColDef)
   - Transaction state management
   - Row styling utilities
   - **Status**: Not adopted by applet implementations (abstraction too heavy?)

### Comparison: ActionMenu Centralization Pattern

The ActionMenu component provides a good model for AG Grid centralization:

```typescript
// ActionMenu interface (from mui-components/ActionMenu.tsx)
export interface ActionMenuItem<T = void> {
  label: string;
  icon?: React.ReactNode;
  onClick?: (item: T, event: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean | ((item: T) => boolean);
  appliesTo?: (item: T) => boolean;
  divider?: boolean;
  component?: React.ElementType;
}

export interface ActionMenuProps<T = void> {
  menuItems: ActionMenuItem<T>[];
  item?: T;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  trigger?: React.ReactElement;
  icon?: React.ReactNode;
  sx?: any;
  ariaLabel?: string;
  stopPropagation?: boolean;
}
```

**Key Lessons from ActionMenu**:
- Generic type support for item data
- Flexible configuration via interface
- Optional overrides for customization
- Handles common concerns (stopPropagation, accessibility)
- Easy to consume from any component

---

## Recommended Centralization Architecture

### Proposed Package Structure

```
packages/mui-components/src/
├── ag-grid/
│   ├── index.ts                      # Public exports
│   ├── columns/
│   │   ├── createCheckboxColumn.ts   # Checkbox selection column
│   │   ├── createActionsColumn.tsx   # Actions menu column with ActionMenu
│   │   ├── createExpandColumn.ts     # Master-detail expand column
│   │   └── createStatusColumn.tsx    # Status chip column
│   ├── renderers/
│   │   ├── StatusCellRenderer.tsx    # Reusable status renderer
│   │   ├── DateCellRenderer.tsx      # Common date formatters
│   │   └── ActionsCellRenderer.tsx   # ActionMenu cell renderer
│   ├── hooks/
│   │   ├── useAgGridRef.ts           # Typed grid ref with helpers
│   │   ├── useAgGridSelection.ts     # Selection state management
│   │   ├── useMasterDetail.ts        # Master-detail configuration
│   │   └── useAgGridProps.ts         # Common grid props builder
│   ├── utils/
│   │   ├── defaultColDef.ts          # Shared default column definition
│   │   ├── valueFormatters.ts        # Common formatters (date, currency, etc)
│   │   └── gridHelpers.ts            # Utility functions
│   └── types.ts                      # Shared TypeScript types
```

### Why mui-components Instead of Separate Package?

**Pros of mui-components location**:
1. Already importing from `@smbc/mui-components` in all applets
2. Consistent with other UI utilities (AgGridTheme, ActionMenu, StatusChip)
3. No new package.json dependencies to manage
4. Easier discoverability alongside related components
5. Similar to how AgGridTheme is already located there

**Cons**:
1. Larger package size (minimal - tree-shaking handles this)
2. Couples AG Grid utilities to MUI components package

**Decision**: Place in mui-components for consistency and ease of use.

---

## Specific Centralization Opportunities

### Priority 1: High Impact, Low Risk

#### 1.1 **Default Column Definition Constant**

**File**: `packages/mui-components/src/ag-grid/utils/defaultColDef.ts`

```typescript
import type { ColDef } from 'ag-grid-community';

/**
 * Default column definition for all AG Grid implementations.
 * Provides consistent sorting, filtering, and resizing behavior.
 */
export const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  menuTabs: ['filterMenuTab', 'columnsMenuTab'],
} as const;

/**
 * Creates a default column definition with custom overrides.
 * @param overrides - Properties to override in the default definition
 */
export function createDefaultColDef(overrides?: Partial<ColDef>): ColDef {
  return {
    ...DEFAULT_COL_DEF,
    ...overrides,
  };
}
```

**Usage Example**:
```typescript
// Before:
defaultColDef={{
  filter: true,
  sortable: true,
  resizable: true,
  menuTabs: ["filterMenuTab"],
}}

// After:
import { DEFAULT_COL_DEF } from '@smbc/mui-components';

defaultColDef={DEFAULT_COL_DEF}

// Or with overrides:
defaultColDef={createDefaultColDef({ menuTabs: ['filterMenuTab'] })}
```

**Impact**: Affects all 4 implementations, saves ~15 lines per implementation

---

#### 1.2 **Checkbox Selection Column Factory**

**File**: `packages/mui-components/src/ag-grid/columns/createCheckboxColumn.ts`

```typescript
import type { ColDef } from 'ag-grid-community';

export interface CheckboxColumnOptions {
  /** Maximum width of the checkbox column */
  maxWidth?: number;
  /** Whether to include header checkbox for "select all" */
  headerCheckbox?: boolean;
  /** Field name for the checkbox column */
  field?: string;
  /** Custom cell class */
  cellClass?: string;
}

/**
 * Creates a checkbox selection column with standard configuration.
 * Pinned to the left, not sortable or filterable.
 */
export function createCheckboxColumn(options?: CheckboxColumnOptions): ColDef {
  const {
    maxWidth = 50,
    headerCheckbox = true,
    field = 'checkbox',
    cellClass,
  } = options || {};

  return {
    field,
    headerName: '',
    maxWidth,
    checkboxSelection: true,
    headerCheckboxSelection: headerCheckbox,
    sortable: false,
    filter: false,
    pinned: 'left',
    resizable: false,
    lockPosition: true,
    suppressColumnsToolPanel: true,
    ...(cellClass && { cellClass }),
  };
}
```

**Usage Example**:
```typescript
// Before:
{
  field: "checkbox",
  headerName: "",
  maxWidth: 30,
  checkboxSelection: true,
  headerCheckboxSelection: true,
  sortable: false,
  filter: false,
  pinned: "left",
  resizable: false,
  lockPosition: true,
  suppressColumnsToolPanel: true,
}

// After:
import { createCheckboxColumn } from '@smbc/mui-components';

createCheckboxColumn({ maxWidth: 30 })
```

**Impact**: Affects 2 implementations, saves ~12 lines per implementation

---

#### 1.3 **Actions Column with ActionMenu**

**File**: `packages/mui-components/src/ag-grid/columns/createActionsColumn.tsx`

```typescript
import React from 'react';
import { Box } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { ActionMenuItem } from '../../ActionMenu';
import { ActionMenu } from '../../ActionMenu';

export interface ActionsColumnOptions<T = any> {
  /** Action menu items */
  menuItems: ActionMenuItem<T>[] | ((item: T) => ActionMenuItem<T>[]);
  /** Maximum width of the actions column */
  maxWidth?: number;
  /** Field name for the actions column */
  field?: string;
  /** Custom cell class */
  cellClass?: string;
  /** Aria label for the menu button */
  ariaLabel?: string;
  /** Whether to center the actions button */
  centered?: boolean;
}

/**
 * Creates an actions column with ActionMenu integration.
 * Pinned to the right, not sortable or filterable.
 */
export function createActionsColumn<T = any>(
  options: ActionsColumnOptions<T>
): ColDef {
  const {
    menuItems,
    maxWidth = 50,
    field = 'actions',
    cellClass = 'actions-cell',
    ariaLabel = 'More Actions',
    centered = true,
  } = options;

  const cellRenderer = (params: any) => {
    if (!params.data) return null;

    const items = typeof menuItems === 'function'
      ? menuItems(params.data)
      : menuItems;

    const content = (
      <ActionMenu<T>
        menuItems={items}
        item={params.data}
        stopPropagation={true}
        ariaLabel={ariaLabel}
      />
    );

    return centered ? (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {content}
      </Box>
    ) : content;
  };

  return {
    field,
    headerName: '',
    maxWidth,
    sortable: false,
    filter: false,
    cellRenderer,
    pinned: 'right',
    resizable: false,
    cellClass,
    suppressColumnsToolPanel: true,
  };
}
```

**Usage Example**:
```typescript
// Before:
const createActionsCellRenderer = (navigate: (path: string) => void) => (params: any) => {
  const menuItems: ActionMenuItem<Event>[] = [ /* ... */ ];
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <ActionMenu<Event>
        menuItems={menuItems}
        item={params.data}
        stopPropagation={true}
      />
    </Box>
  );
};

const columnDefs: ColDef[] = [
  // ... other columns
  {
    field: "actions",
    headerName: "",
    maxWidth: 50,
    sortable: false,
    filter: false,
    cellRenderer: createActionsCellRenderer(navigate),
    pinned: "right",
    resizable: false,
    cellClass: "actions-cell",
    suppressColumnsToolPanel: true,
  },
];

// After:
import { createActionsColumn } from '@smbc/mui-components';

const columnDefs: ColDef[] = [
  // ... other columns
  createActionsColumn<Event>({
    menuItems: [
      {
        label: "Show Details",
        icon: <ListIcon fontSize="small" />,
        href: `#/events/detail?id=${item.id}`,
        onClick: (item, event) => {
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            navigate(`/events/detail?id=${item.event_ref_id}`);
          }
        },
        component: "a",
      },
      // ... more items
    ],
  }),
];
```

**Impact**: Saves ~40 lines in ewi-events, reusable across all grids with actions

---

#### 1.4 **Expand/Collapse Column Factory**

**File**: `packages/mui-components/src/ag-grid/columns/createExpandColumn.ts`

```typescript
import type { ColDef } from 'ag-grid-community';

export interface ExpandColumnOptions {
  /** Width of the expand column */
  width?: number;
  /** Minimum width of the expand column */
  minWidth?: number;
  /** Custom cell class */
  cellClass?: string;
}

/**
 * Creates an expand/collapse column for master-detail grids.
 * Pinned to the left, not sortable or filterable.
 */
export function createExpandColumn(options?: ExpandColumnOptions): ColDef {
  const {
    width = 60,
    minWidth = 60,
    cellClass = 'expand-cell',
  } = options || {};

  return {
    cellRenderer: 'agGroupCellRenderer',
    headerName: '',
    width,
    minWidth,
    cellRendererParams: {
      innerRenderer: () => '',
    },
    pinned: 'left',
    lockPosition: true,
    sortable: false,
    filter: false,
    cellClass,
    suppressColumnsToolPanel: true,
  };
}
```

**Usage Example**:
```typescript
// Before:
{
  cellRenderer: "agGroupCellRenderer",
  headerName: "",
  width: 60,
  minWidth: 60,
  cellRendererParams: {
    innerRenderer: () => "",
  },
  pinned: "left",
  lockPosition: true,
  sortable: false,
  filter: false,
  cellClass: "expand-cell",
  suppressColumnsToolPanel: true,
}

// After:
import { createExpandColumn } from '@smbc/mui-components';

createExpandColumn()
```

**Impact**: Saves ~13 lines in ewi-events

---

### Priority 2: Medium Impact, Medium Complexity

#### 2.1 **Status Cell Renderer Factory**

**File**: `packages/mui-components/src/ag-grid/renderers/createStatusCellRenderer.tsx`

```typescript
import React from 'react';
import { useTheme } from '@mui/material';
import { StatusChip } from '../../StatusChip';
import type { StatusChipProps } from '../../StatusChip';
import { ui, color } from '@smbc/ui-core';

export type StatusVariant = 'success' | 'warning' | 'error' | 'default' | 'custom';

export interface StatusMapping {
  /** Variant for the status chip */
  variant: StatusVariant;
  /** Optional custom colors for 'custom' variant */
  customColors?: {
    outline?: string;
    fill?: string;
    text?: string;
  };
}

export interface StatusCellRendererOptions {
  /** Map of status values to StatusChip variants */
  statusMap: Record<string, StatusMapping>;
  /** Default variant when status not in map */
  defaultVariant?: StatusVariant;
  /** Label to display when value is null/undefined */
  emptyLabel?: string;
  /** Custom label transformer (e.g., uppercase, replace dashes) */
  formatLabel?: (value: string) => string;
  /** Custom chip props */
  chipProps?: Partial<StatusChipProps>;
}

/**
 * Creates a reusable status cell renderer using StatusChip component.
 * Handles null values, custom mapping, and consistent styling.
 */
export function createStatusCellRenderer(
  options: StatusCellRendererOptions
) {
  const {
    statusMap,
    defaultVariant = 'default',
    emptyLabel = 'UNKNOWN',
    formatLabel = (value) =>
      value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    chipProps = {},
  } = options;

  return function StatusCellRenderer(params: any) {
    const theme = useTheme();

    if (!params.value) {
      return (
        <StatusChip
          variant="default"
          label={emptyLabel}
          sx={{
            fontSize: '12px',
            height: '24px',
            width: '160px',
            transition: 'none !important',
            '& .MuiChip-label': {
              px: 1.5,
              py: 0.5,
              textAlign: 'center',
              width: '100%',
            },
            ...chipProps.sx,
          }}
          size="small"
          {...chipProps}
        />
      );
    }

    const mapping = statusMap[params.value] || { variant: defaultVariant };
    const label = formatLabel(params.value);

    // Custom variant with custom colors
    if (mapping.variant === 'custom' && mapping.customColors) {
      return (
        <StatusChip
          variant="custom"
          label={label}
          outlineColor={mapping.customColors.outline}
          fillColor={mapping.customColors.fill}
          textColor={mapping.customColors.text}
          sx={{
            fontSize: '12px',
            fontWeight: theme.palette.mode === 'dark' ? 300 : 400,
            height: '24px',
            width: '160px',
            transition: 'none !important',
            '& .MuiChip-label': {
              px: 1.5,
              py: 0.5,
              textAlign: 'center',
              width: '100%',
            },
            ...chipProps.sx,
          }}
          size="small"
          {...chipProps}
        />
      );
    }

    return (
      <StatusChip
        variant={mapping.variant}
        label={label}
        sx={{
          fontSize: '12px',
          fontWeight: theme.palette.mode === 'dark' ? 300 : 400,
          height: '24px',
          width: '160px',
          transition: 'none !important',
          '& .MuiChip-label': {
            px: 1.5,
            py: 0.5,
            textAlign: 'center',
            width: '100%',
          },
          ...chipProps.sx,
        }}
        size="small"
        {...chipProps}
      />
    );
  };
}
```

**Usage Example**:
```typescript
// Before: 90+ lines of inline renderer in Events.tsx

// After:
import { createStatusCellRenderer } from '@smbc/mui-components';
import { ui, color } from '@smbc/ui-core';

const StatusCellRenderer = createStatusCellRenderer({
  statusMap: {
    'on-course': { variant: 'success' },
    'almost-due': { variant: 'warning' },
    'past-due': { variant: 'error' },
    'needs-attention': {
      variant: 'custom',
      customColors: {
        outline: color.neutral.plum100,
        fill: ui.color.background.tertiary,
        text: ui.color.text.primary,
      },
    },
  },
});

const columnDefs: ColDef[] = [
  // ...
  {
    headerName: 'Lifecycle Status',
    field: 'lifecycle_status',
    cellRenderer: StatusCellRenderer,
    pinned: 'right',
    filter: 'agTextColumnFilter',
    minWidth: 180,
  },
];
```

**Impact**: Saves ~90 lines in ewi-events, eliminates hardcoded colors in reports

---

#### 2.2 **useAgGridRef Hook**

**File**: `packages/mui-components/src/ag-grid/hooks/useAgGridRef.ts`

```typescript
import { useRef, useCallback } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { GridApi, ColumnApi } from 'ag-grid-community';

export interface AgGridRefHelpers {
  /** The grid ref */
  gridRef: React.RefObject<AgGridReact>;
  /** Grid API (available after grid ready) */
  api: GridApi | null;
  /** Column API (available after grid ready) */
  columnApi: ColumnApi | null;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Show column chooser */
  showColumnChooser: () => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Export to CSV */
  exportToCsv: (filename?: string) => void;
  /** Get selected rows */
  getSelectedRows: <T = any>() => T[];
  /** Set filter model */
  setFilterModel: (model: any) => void;
  /** Refresh cells */
  refreshCells: () => void;
  /** Size columns to fit */
  sizeColumnsToFit: () => void;
}

/**
 * Hook that provides a typed grid ref with common helper methods.
 * Abstracts away the gridRef.current?.api pattern.
 */
export function useAgGridRef<T = any>(): AgGridRefHelpers {
  const gridRef = useRef<AgGridReact>(null);

  const api = gridRef.current?.api || null;
  const columnApi = gridRef.current?.columnApi || null;

  const deselectAll = useCallback(() => {
    gridRef.current?.api?.deselectAll();
  }, []);

  const showColumnChooser = useCallback(() => {
    // AG Grid v30+ uses showColumnChooser()
    // @ts-ignore - showColumnChooser may not be in all AG Grid versions
    gridRef.current?.api?.showColumnChooser?.();
  }, []);

  const clearFilters = useCallback(() => {
    gridRef.current?.api?.setFilterModel(null);
  }, []);

  const exportToCsv = useCallback((filename = 'export.csv') => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: filename,
    });
  }, []);

  const getSelectedRows = useCallback((): T[] => {
    return gridRef.current?.api?.getSelectedRows() || [];
  }, []);

  const setFilterModel = useCallback((model: any) => {
    gridRef.current?.api?.setFilterModel(model);
  }, []);

  const refreshCells = useCallback(() => {
    gridRef.current?.api?.refreshCells();
  }, []);

  const sizeColumnsToFit = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, []);

  return {
    gridRef,
    api,
    columnApi,
    deselectAll,
    showColumnChooser,
    clearFilters,
    exportToCsv,
    getSelectedRows,
    setFilterModel,
    refreshCells,
    sizeColumnsToFit,
  };
}
```

**Usage Example**:
```typescript
// Before:
const gridRef = React.useRef<AgGridReact>(null);

// Scattered throughout code:
if (gridRef?.current?.api) {
  gridRef.current.api.deselectAll();
}
if (gridRef?.current?.api) {
  gridRef.current.api.showColumnChooser();
}

// After:
import { useAgGridRef } from '@smbc/mui-components';

const { gridRef, deselectAll, showColumnChooser, getSelectedRows } = useAgGridRef<Event>();

// Cleaner usage:
deselectAll();
showColumnChooser();
const selected = getSelectedRows();
```

**Impact**: Simplifies grid ref usage in all 4 implementations

---

#### 2.3 **useAgGridSelection Hook**

**File**: `packages/mui-components/src/ag-grid/hooks/useAgGridSelection.ts`

```typescript
import { useState, useCallback } from 'react';
import type { SelectionChangedEvent } from 'ag-grid-community';

export interface AgGridSelectionOptions<T> {
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface AgGridSelectionHelpers<T> {
  /** Currently selected rows */
  selectedRows: T[];
  /** Selection change handler for AG Grid */
  onSelectionChanged: (event: SelectionChangedEvent) => void;
  /** Clear selection programmatically */
  clearSelection: () => void;
  /** Set selection programmatically */
  setSelectedRows: (rows: T[]) => void;
}

/**
 * Hook that manages AG Grid selection state.
 * Provides selectedRows state and onSelectionChanged handler.
 */
export function useAgGridSelection<T = any>(
  options?: AgGridSelectionOptions<T>
): AgGridSelectionHelpers<T> {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selectedNodes = event.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node) => node.data as T);
      setSelectedRows(selectedData);
      options?.onSelectionChange?.(selectedData);
    },
    [options]
  );

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  return {
    selectedRows,
    onSelectionChanged,
    clearSelection,
    setSelectedRows,
  };
}
```

**Usage Example**:
```typescript
// Before:
const [selectedRows, setSelectedRows] = useState<Event[]>([]);

const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
  const selectedNodes = event.api.getSelectedNodes();
  const selectedData = selectedNodes.map((node) => node.data);
  console.log("Selection changed:", selectedData.length, selectedData);
  setSelectedRows(selectedData);
}, []);

// After:
import { useAgGridSelection } from '@smbc/mui-components';

const { selectedRows, onSelectionChanged, clearSelection } = useAgGridSelection<Event>({
  onSelectionChange: (rows) => console.log("Selection changed:", rows.length, rows),
});
```

**Impact**: Saves ~8 lines per implementation with selection

---

#### 2.4 **Value Formatters Utility**

**File**: `packages/mui-components/src/ag-grid/utils/valueFormatters.ts`

```typescript
import type { ValueFormatterParams } from 'ag-grid-community';

/**
 * Formats a date value by extracting just the date part (YYYY-MM-DD)
 * from an ISO string. Returns placeholder if value is null/undefined.
 */
export function formatIsoDate(
  params: ValueFormatterParams,
  placeholder = '---'
): string {
  return params.value ? params.value.split('T')[0] : placeholder;
}

/**
 * Formats a date value using toLocaleDateString().
 * Returns placeholder if value is null/undefined.
 */
export function formatLocalDate(
  params: ValueFormatterParams,
  placeholder = '---',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!params.value) return placeholder;
  try {
    const date = new Date(params.value);
    return date.toLocaleDateString(undefined, options);
  } catch {
    return placeholder;
  }
}

/**
 * Formats a currency value with proper locale and currency symbol.
 */
export function formatCurrency(
  params: ValueFormatterParams,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (params.value == null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(params.value);
}

/**
 * Formats a number with thousand separators.
 */
export function formatNumber(
  params: ValueFormatterParams,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  if (params.value == null) return '';
  return new Intl.NumberFormat(locale, options).format(params.value);
}

/**
 * Formats a percentage value.
 */
export function formatPercent(
  params: ValueFormatterParams,
  decimals = 2,
  locale = 'en-US'
): string {
  if (params.value == null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(params.value / 100);
}
```

**Usage Example**:
```typescript
// Before:
{
  field: "event_date",
  valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---"),
}

{
  field: "last_review",
  valueFormatter: ({ value }) =>
    value ? new Date(value).toLocaleDateString() : "---",
}

// After:
import { formatIsoDate, formatLocalDate } from '@smbc/mui-components';

{
  field: "event_date",
  valueFormatter: formatIsoDate,
}

{
  field: "last_review",
  valueFormatter: formatLocalDate,
}
```

**Impact**: Saves ~5 lines per usage, improves consistency

---

### Priority 3: Lower Priority, Nice to Have

#### 3.1 **Master-Detail Configuration Helper**

**File**: `packages/mui-components/src/ag-grid/hooks/useMasterDetail.ts`

```typescript
import type { GetDetailRowDataParams } from 'ag-grid-community';
import { ui } from '@smbc/ui-core';

export interface MasterDetailOptions<T = any> {
  /** Whether to enable master-detail */
  enabled: boolean;
  /** Custom detail cell renderer component */
  detailCellRenderer?: any;
  /** Height of detail rows */
  detailRowHeight?: number;
  /** Function to determine if a row can be expanded */
  isRowMaster?: (dataItem: T) => boolean;
  /** Detail grid options for agDetailCellRenderer */
  detailGridOptions?: any;
  /** Function to get detail row data */
  getDetailRowData?: (params: GetDetailRowDataParams) => void;
  /** Whether to apply row styling for expanded/detail rows */
  applyRowStyling?: boolean;
}

export interface MasterDetailConfig {
  /** Master detail props for AgGridReact */
  masterDetail?: boolean;
  detailCellRenderer?: any;
  detailRowHeight?: number;
  isRowMaster?: (dataItem: any) => boolean;
  detailCellRendererParams?: any;
  getRowStyle?: (params: any) => any;
}

/**
 * Creates master-detail configuration for AG Grid.
 * Handles expanded row styling and detail row configuration.
 */
export function createMasterDetailConfig<T = any>(
  options: MasterDetailOptions<T>
): MasterDetailConfig {
  if (!options.enabled) {
    return {};
  }

  const config: MasterDetailConfig = {
    masterDetail: true,
    detailCellRenderer: options.detailCellRenderer,
    detailRowHeight: options.detailRowHeight || 200,
    isRowMaster: options.isRowMaster || (() => true),
  };

  // Add detail cell renderer params if using built-in renderer
  if (options.detailGridOptions || options.getDetailRowData) {
    config.detailCellRendererParams = {
      detailGridOptions: options.detailGridOptions,
      getDetailRowData: options.getDetailRowData,
    };
  }

  // Add row styling if enabled
  if (options.applyRowStyling !== false) {
    config.getRowStyle = (params: any) => {
      if (params.node.expanded) {
        return { backgroundColor: ui.tableRow.on.hover.background };
      }
      if (params.node.detail) {
        return { backgroundColor: ui.tableRow.on.selected.background };
      }
      return undefined;
    };
  }

  return config;
}
```

**Usage Example**:
```typescript
// Before: Multiple lines of master-detail config in Events.tsx

// After:
import { createMasterDetailConfig } from '@smbc/mui-components';

const masterDetailConfig = createMasterDetailConfig({
  enabled: true,
  detailCellRenderer: DetailCellRenderer,
  detailRowHeight: 200,
  applyRowStyling: true,
});

<AgGridReact
  {...masterDetailConfig}
  // other props
/>
```

**Impact**: Saves ~20 lines in implementations with master-detail

---

#### 3.2 **Common Grid Props Builder**

**File**: `packages/mui-components/src/ag-grid/utils/gridHelpers.ts`

```typescript
import type { AgGridReactProps } from 'ag-grid-react';

export interface CommonGridPropsOptions {
  /** Whether to enable row selection */
  selection?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Header height in pixels */
  headerHeight?: number;
  /** Whether to enable browser tooltips */
  enableBrowserTooltips?: boolean;
  /** Column menu type */
  columnMenu?: 'legacy' | 'new';
  /** Whether to suppress horizontal scroll */
  suppressHorizontalScroll?: boolean;
}

/**
 * Returns common AG Grid props with sensible defaults.
 * Can be spread into AgGridReact component.
 */
export function getCommonGridProps(
  options?: CommonGridPropsOptions
): Partial<AgGridReactProps> {
  const {
    selection = false,
    selectionMode = 'multiple',
    headerHeight = 54,
    enableBrowserTooltips = true,
    columnMenu = 'legacy',
    suppressHorizontalScroll = false,
  } = options || {};

  return {
    rowSelection: selection ? selectionMode : undefined,
    animateRows: true,
    suppressCellFocus: true,
    suppressRowClickSelection: selection,
    cellSelection: false,
    suppressHorizontalScroll,
    alwaysShowHorizontalScroll: false,
    columnMenu,
    headerHeight,
    enableBrowserTooltips,
  };
}
```

**Usage Example**:
```typescript
// Before:
<AgGridReact
  ref={gridRef}
  rowData={data}
  columnDefs={columnDefs}
  rowSelection="multiple"
  animateRows
  suppressCellFocus
  suppressRowClickSelection
  cellSelection={false}
  suppressHorizontalScroll={false}
  alwaysShowHorizontalScroll={false}
  columnMenu="legacy"
  headerHeight={54}
  enableBrowserTooltips={true}
  // ...
/>

// After:
import { getCommonGridProps } from '@smbc/mui-components';

<AgGridReact
  ref={gridRef}
  rowData={data}
  columnDefs={columnDefs}
  {...getCommonGridProps({ selection: true })}
  // ...
/>
```

**Impact**: Saves ~10 lines per implementation

---

## Implementation Priority & Impact Assessment

### High Priority (Do First)

| Feature | Effort | Impact | Lines Saved | Files Affected |
|---------|--------|--------|-------------|----------------|
| Default ColDef Constant | Low | High | ~60 | 4 |
| Checkbox Column Factory | Low | Medium | ~24 | 2 |
| Value Formatters | Low | Medium | ~15 | 3 |
| useAgGridRef Hook | Medium | High | ~40 | 4 |
| Common Grid Props | Low | Medium | ~40 | 4 |

**Total High Priority**: ~179 lines saved, affects all implementations

### Medium Priority (Do Next)

| Feature | Effort | Impact | Lines Saved | Files Affected |
|---------|--------|--------|-------------|----------------|
| Actions Column Factory | Medium | High | ~60 | 1+ |
| Status Cell Renderer | Medium | High | ~120 | 2 |
| Expand Column Factory | Low | Medium | ~13 | 1 |
| useAgGridSelection Hook | Low | Medium | ~32 | 4 |

**Total Medium Priority**: ~225 lines saved

### Lower Priority (Nice to Have)

| Feature | Effort | Impact | Lines Saved | Files Affected |
|---------|--------|--------|-------------|----------------|
| Master-Detail Config | Medium | Low | ~20 | 2 |
| Type Definitions | Low | Low | - | All |

**Total Lower Priority**: ~20 lines saved

### Grand Total

- **Lines of duplicate code to eliminate**: ~424 lines
- **Maintenance improvements**: Update patterns in 1 place instead of 4+
- **Consistency improvements**: All grids use same patterns, look, and behavior
- **Developer experience**: Easier to create new grids, less boilerplate

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create package structure in `mui-components/src/ag-grid/`
2. Implement high-priority utilities (DEFAULT_COL_DEF, value formatters, common props)
3. Implement checkbox column factory
4. Write unit tests
5. Update documentation

### Phase 2: Core Features (Week 2)
1. Implement useAgGridRef hook
2. Implement useAgGridSelection hook
3. Implement status cell renderer factory
4. Update 1-2 applets to use new utilities (proof of concept)

### Phase 3: Advanced Features (Week 3)
1. Implement actions column factory
2. Implement expand column factory
3. Implement master-detail config helper
4. Migrate remaining applets

### Phase 4: Cleanup (Week 4)
1. Remove duplicate code from all implementations
2. Update reports applet to use AgGridTheme
3. Document all new utilities
4. Create examples and usage guides

---

## Code Examples: Before & After

### Example 1: Simple Grid (ewi-obligor)

**Before** (225 lines):
```typescript
const columnDefs: ColDef[] = useMemo(
  () => [
    {
      field: "checkbox",
      headerName: "",
      maxWidth: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      sortable: false,
      filter: false,
      pinned: "left",
      resizable: false,
      suppressColumnsToolPanel: true,
    },
    {
      headerName: "Obligor Name",
      field: "obligor_name",
      flex: 1,
      minWidth: 200,
    },
    // ... more columns
  ],
  [],
);

return (
  <AgGridReact
    ref={gridRef}
    popupParent={popupParent}
    headerHeight={50}
    rowData={obligors}
    columnDefs={columnDefs}
    rowSelection="multiple"
    suppressCellFocus
    suppressRowClickSelection
    animateRows={true}
    cellSelection={false}
    pagination={false}
    suppressHorizontalScroll={false}
    alwaysShowHorizontalScroll={false}
    columnMenu="legacy"
    defaultColDef={{
      filter: true,
      sortable: true,
      resizable: true,
      menuTabs: ["filterMenuTab", "columnsMenuTab"],
    }}
  />
);
```

**After** (significantly shorter):
```typescript
import {
  createCheckboxColumn,
  DEFAULT_COL_DEF,
  getCommonGridProps,
  useAgGridRef,
} from '@smbc/mui-components';

const { gridRef } = useAgGridRef();

const columnDefs: ColDef[] = useMemo(
  () => [
    createCheckboxColumn(),
    {
      headerName: "Obligor Name",
      field: "obligor_name",
      flex: 1,
      minWidth: 200,
    },
    // ... more columns
  ],
  [],
);

return (
  <AgGridReact
    ref={gridRef}
    popupParent={popupParent}
    rowData={obligors}
    columnDefs={columnDefs}
    defaultColDef={DEFAULT_COL_DEF}
    {...getCommonGridProps({ selection: true, headerHeight: 50 })}
  />
);
```

**Lines Saved**: ~25 lines

---

### Example 2: Complex Grid with Actions (ewi-events)

**Before** (680 lines with custom renderers):
```typescript
// 90+ lines for StatusCellRenderer
const StatusCellRenderer = (params: any) => {
  // ... complex logic
};

// 50+ lines for ActionsCellRenderer
const createActionsCellRenderer = (navigate) => (params: any) => {
  // ... complex logic
};

// 13 lines for expand column
{
  cellRenderer: "agGroupCellRenderer",
  headerName: "",
  width: 60,
  // ... more config
}

// 20+ lines for master-detail config
masterDetail
detailCellRenderer={DetailCellRenderer}
detailRowHeight={200}
getRowStyle={(params) => {
  // ... styling logic
}}
```

**After** (significantly reduced):
```typescript
import {
  createCheckboxColumn,
  createExpandColumn,
  createActionsColumn,
  createStatusCellRenderer,
  createMasterDetailConfig,
  DEFAULT_COL_DEF,
  getCommonGridProps,
  useAgGridRef,
  useAgGridSelection,
  formatIsoDate,
} from '@smbc/mui-components';

const { gridRef, showColumnChooser, clearFilters } = useAgGridRef<Event>();
const { selectedRows, onSelectionChanged } = useAgGridSelection<Event>();

const StatusCellRenderer = createStatusCellRenderer({
  statusMap: {
    'on-course': { variant: 'success' },
    'almost-due': { variant: 'warning' },
    'past-due': { variant: 'error' },
    'needs-attention': {
      variant: 'custom',
      customColors: {
        outline: color.neutral.plum100,
        fill: ui.color.background.tertiary,
        text: ui.color.text.primary,
      },
    },
  },
});

const columnDefs: ColDef[] = useMemo(() => [
  createCheckboxColumn({ maxWidth: 30 }),
  createExpandColumn(),
  {
    headerName: "Event Date",
    field: "event_date",
    valueFormatter: formatIsoDate,
    minWidth: 150,
    flex: 1,
  },
  // ... more columns
  {
    headerName: "Lifecycle Status",
    field: "lifecycle_status",
    cellRenderer: StatusCellRenderer,
    pinned: "right",
  },
  createActionsColumn<Event>({
    menuItems: [
      {
        label: "Show Details",
        icon: <ListIcon fontSize="small" />,
        onClick: (item) => navigate(`/events/detail?id=${item.id}`),
      },
      // ... more actions
    ],
  }),
], [navigate]);

const masterDetailConfig = createMasterDetailConfig({
  enabled: true,
  detailCellRenderer: DetailCellRenderer,
  detailRowHeight: 200,
});

return (
  <AgGridReact
    ref={gridRef}
    rowData={filteredEvents}
    columnDefs={columnDefs}
    onSelectionChanged={onSelectionChanged}
    defaultColDef={DEFAULT_COL_DEF}
    {...getCommonGridProps({ selection: true })}
    {...masterDetailConfig}
  />
);
```

**Lines Saved**: ~200+ lines (mostly from eliminating renderer boilerplate)

---

## Recommendations

### Immediate Actions

1. **Start with Foundation**: Implement DEFAULT_COL_DEF and value formatters (1-2 days)
2. **Add Column Factories**: Implement checkbox, expand, and actions columns (2-3 days)
3. **Create Hooks**: Implement useAgGridRef and useAgGridSelection (2-3 days)
4. **Migrate One Applet**: Use ewi-obligor as proof of concept (1 day)

### Long-term Strategy

1. **Deprecate Direct Usage**: Encourage all new grids to use centralized utilities
2. **Migrate Gradually**: Update existing grids one at a time
3. **Document Patterns**: Create clear examples and best practices
4. **Monitor Adoption**: Track usage of new utilities vs direct implementation

### Anti-patterns to Avoid

1. **Don't over-abstract**: Keep utilities simple and composable
2. **Don't break existing code**: Maintain backward compatibility
3. **Don't force migration**: Let teams adopt gradually
4. **Don't ignore edge cases**: Support customization when needed

---

## Questions & Considerations

### About dataview-ag-grid Package

**Question**: Should we use/enhance dataview-ag-grid instead of creating new utilities?

**Analysis**:
- dataview-ag-grid is designed for the dataview framework abstraction
- It requires adopting the entire dataview pattern (DataView, DataViewConfig)
- Current applets use AG Grid directly, not through dataview
- The abstraction level is higher than what most applets need

**Recommendation**:
- Keep dataview-ag-grid for dataview framework use cases
- Create lighter-weight utilities in mui-components for direct AG Grid usage
- Maintain both approaches - they serve different use cases

### About AgGridTheme

**Question**: Should all implementations use AgGridTheme?

**Answer**: Yes! The reports applet should be updated to use AgGridTheme for consistency.

**Benefits**:
- Automatic light/dark mode switching
- Token-based styling
- Popup parent management
- Consistent theming across all grids

### About StatusChip Component

**Question**: Are there other chip/badge patterns to centralize?

**Investigation Needed**:
- Search for other Badge/Chip usage patterns
- Look for color-coded status displays
- Consider priority/severity indicators

---

## Conclusion

The AG Grid centralization analysis reveals significant opportunities for code reuse and consistency improvements. By implementing the recommended utilities and hooks, we can:

1. **Reduce ~424 lines of duplicate code**
2. **Improve consistency across all grid implementations**
3. **Make it easier to create new grids with less boilerplate**
4. **Centralize updates and bug fixes in one location**
5. **Follow the successful pattern established by ActionMenu**

The phased migration strategy allows for gradual adoption without disrupting existing functionality, similar to how ActionMenu was successfully centralized.

**Next Steps**:
1. Review and approve this analysis
2. Begin Phase 1 implementation (foundation utilities)
3. Create proof-of-concept migration (ewi-obligor applet)
4. Gather feedback and iterate
5. Proceed with full migration across all applets
