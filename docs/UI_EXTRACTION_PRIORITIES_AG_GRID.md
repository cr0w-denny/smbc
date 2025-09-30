# UI Package Extraction Priorities (ag-grid Focused)

## Overview

Re-prioritized extraction plan for dataview package features, leveraging ag-grid's built-in capabilities for selection, pagination, filtering, and table rendering.

## Core Strategy

**Lean heavily on ag-grid** for:
- Row selection and multi-select
- Pagination and virtual scrolling
- Column sorting and filtering
- Cell rendering and editing
- Keyboard navigation
- Performance optimization

**Extract from dataview** only what ag-grid doesn't handle well:
- Business logic orchestration
- Permission checking
- Action systems
- API integration patterns
- Form handling

## Revised Top 3 Most Valuable Features

### 1. **Action System** (`@smbc/ui-actions` + `@smbc/mui-actions`)

**Value Score: 10/10** ⬆️ (increased from 9/10)

**Why it's even more valuable with ag-grid:**
- **ag-grid integration**: ag-grid has excellent action column support but no standardized action patterns
- **Context menus**: ag-grid context menus need consistent action definitions
- **Bulk operations**: ag-grid selection + standardized bulk actions = powerful combination
- **Cell-level actions**: Row actions integrate perfectly with ag-grid cell renderers
- **Toolbar integration**: Global actions work seamlessly with ag-grid toolbars

**ag-grid specific benefits:**
- `getContextMenuItems()` can use standard action definitions
- `onSelectionChanged()` can trigger bulk action availability checks
- Cell renderers can use consistent action button patterns
- Action permissions integrate with ag-grid's `suppressRowClickSelection`

### 2. **API Integration** (`@smbc/ui-data` + `@smbc/ui-queries`)

**Value Score: 9/10** ⬆️ (new to top 3)

**Why it's critical with ag-grid:**
- **Server-side data**: ag-grid enterprise features need consistent API patterns
- **Infinite scrolling**: Standardized pagination/cursor logic
- **Real-time updates**: WebSocket integration with ag-grid data updates
- **Caching strategies**: React Query + ag-grid data synchronization
- **Error handling**: Consistent error states across all ag-grid tables

**ag-grid specific benefits:**
- `getRows()` function for server-side row model
- Standardized `dataSource` creation patterns
- Optimistic updates that sync with ag-grid state
- Consistent loading indicators and error states

### 3. **Permission System** (`@smbc/ui-permissions`)

**Value Score: 8/10** (same, but simpler scope)

**Why it's still valuable with ag-grid:**
- **Cell-level permissions**: Hide/disable individual cells based on user roles
- **Action filtering**: Filter available actions based on row data + user permissions
- **Column visibility**: Show/hide columns based on user roles
- **Read-only enforcement**: Consistent permission checking across edit operations

**Simplified scope with ag-grid:**
- No need for table-level permission UI (ag-grid handles this)
- Focus on business logic permissions only
- Integration with ag-grid's built-in `editable` and `suppressMenu` options

## Revised Top 3 Easiest Features

### 1. **Core Types** (`@smbc/ui-core`)

**Difficulty Score: 1/10** ⬇️ (decreased from 2/10)

**Even easier with ag-grid focus:**
- Fewer types needed (no selection state, pagination state, etc.)
- Simpler interfaces (ag-grid handles UI state)
- Clear boundaries (just business domain types)

### 2. **Permission Logic** (`@smbc/ui-permissions`)

**Difficulty Score: 2/10** ⬇️ (easier than before)

**Why it's easier with ag-grid:**
- No UI components to build (ag-grid handles visibility)
- Pure business logic functions
- Clear integration points with ag-grid callbacks
- No state management complexity

### 3. **Action Definitions** (`@smbc/ui-actions`)

**Difficulty Score: 3/10** ⬇️ (easier scope)

**Why it's easier with ag-grid:**
- No complex action bar UI to build
- ag-grid provides context menu and toolbar integration
- Focus on action definitions, not action rendering
- Clear separation between logic and presentation

## Features We DON'T Need to Extract

### ❌ **Selection Management**
**Why skip**: ag-grid's selection is excellent
- Built-in multi-select with Ctrl/Shift
- `api.getSelectedRows()` and `api.selectAll()`
- Range selection and checkbox selection
- Performance optimized for large datasets

### ❌ **Table Rendering**
**Why skip**: ag-grid is the table renderer
- Virtual scrolling and infinite scroll
- Column resizing, sorting, filtering
- Cell editing and validation
- Keyboard navigation

### ❌ **Pagination Components**
**Why skip**: ag-grid handles pagination
- Server-side pagination built-in
- Client-side pagination for small datasets
- Jump-to-page and page size controls

### ❌ **Filter UI**
**Why skip**: ag-grid's filtering is comprehensive
- Column-specific filter types
- Custom filter components
- Filter state management
- Advanced filtering with sets and ranges

## Simplified Implementation Strategy

### Phase 1: Essential Abstractions (1 week)
1. **Extract `@smbc/ui-core`** - Core types and interfaces
2. **Extract `@smbc/ui-permissions`** - Permission checking logic
3. **Set up build pipeline** for new packages

### Phase 2: Action System (2 weeks)
1. **Extract `@smbc/ui-actions`** - Action definitions and helpers
2. **Create `@smbc/mui-actions`** - ag-grid integration components
3. **Test with EWI events table** - Real-world validation
4. **Create ag-grid action examples** - Context menus, toolbars, cell actions

### Phase 3: Data Integration (2 weeks)
1. **Extract `@smbc/ui-data`** - API integration patterns
2. **Create ag-grid data source helpers** - Server-side model utilities
3. **Add optimistic update support** - React Query + ag-grid sync
4. **Test with complex data scenarios** - Sorting, filtering, infinite scroll

### Phase 4: Form Integration (1 week)
1. **Extract `@smbc/ui-forms`** - Form state and validation
2. **Create ag-grid edit integration** - Inline editing patterns
3. **Add form dialog patterns** - Create/edit modal integration

## ag-grid Integration Patterns

### Action Integration
```typescript
// Context menu with standard actions
const getContextMenuItems = (params) => {
  const actions = getRowActions(params.node.data, userPermissions);
  return actions.map(action => ({
    name: action.label,
    action: () => action.onClick(params.node.data),
    disabled: action.disabled?.(params.node.data),
    icon: action.icon
  }));
};
```

### Permission Integration
```typescript
// Column definition with permissions
const columnDefs = [
  {
    field: 'sensitiveData',
    hide: !hasPermission('VIEW_SENSITIVE_DATA', userRoles),
    editable: (params) => canEditField('sensitiveData', params.data, userPermissions)
  }
];
```

### Data Integration
```typescript
// Server-side data source
const dataSource = createAgGridDataSource({
  apiConfig: ewiEventsApiConfig,
  queryClient,
  permissionFilter: (row) => canViewRow(row, userPermissions)
});
```

## Success Metrics

### Bundle Size Impact
- **Target**: 40-50% reduction in bundle size for simple ag-grid tables
- **Measurement**: Apps using only actions + permissions vs full dataview

### Development Velocity
- **Target**: 50% faster implementation of new ag-grid tables
- **Measurement**: Time from API spec to working table with actions

### Maintenance Overhead
- **Target**: 60% reduction in ag-grid integration bugs
- **Measurement**: Support tickets related to table functionality

## Migration Path

### Existing Tables
1. **Keep ag-grid as-is** - No changes to table configuration
2. **Replace action handling** - Use extracted action system
3. **Replace permission checks** - Use extracted permission system
4. **Replace API integration** - Use extracted data patterns

### New Tables
1. **Start with ag-grid + extracted packages** - Clean foundation
2. **Use standard patterns** - Actions, permissions, data integration
3. **Leverage ag-grid features** - Don't reinvent selection, filtering, etc.

This approach maximizes value while minimizing complexity by building on ag-grid's strengths rather than competing with them.