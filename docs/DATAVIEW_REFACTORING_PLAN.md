# DataView Package Refactoring Plan

## Overview

Break the monolithic `@smbc/dataview` package into focused, orthogonal packages that can be composed independently. This will improve maintainability, reduce bundle size, and allow teams to adopt only the features they need.

## Current State Analysis

The dataview package currently combines multiple concerns:
- **Data fetching & caching** (react-query integration)
- **Table rendering** (ag-grid integration)
- **Form handling** (create/edit dialogs)
- **Action system** (row/bulk/global actions)
- **Permission checking** (appliesTo, disabled, hidden logic)
- **Transaction management** (optimistic updates, rollback)
- **Activity tracking** (user action logging)
- **Pagination & filtering** (URL state management)
- **Selection management** (checkbox states, bulk operations)

## Proposed Package Structure

### 1. Core Data Layer

#### `@smbc/data-core`
**Purpose**: Foundation types and utilities
```typescript
// Core interfaces that other packages depend on
export interface DataEntity {
  id: string | number;
  [key: string]: any;
}

export interface DataField {
  name: string;
  type: "string" | "number" | "boolean" | "email" | "date" | "select";
  // ... field definition
}

export interface DataSchema<T> {
  fields: DataField[];
  primaryKey: keyof T;
  displayName: (item: T) => string;
}
```

#### `@smbc/data-client`
**Purpose**: API integration and caching
```typescript
// React Query integration, API configuration
export interface DataApiConfig {
  endpoint: string;
  client: any;
  queryKey?: string;
  // ... API configuration
}

export function useDataQuery<T>(config: DataApiConfig) {
  // React Query integration
}

export function useDataMutations<T>(config: DataApiConfig) {
  // Create, update, delete mutations
}
```

### 2. Action System

#### `@smbc/action-core`
**Purpose**: Action definitions and execution
```typescript
export interface BaseAction {
  key: string;
  label: string;
  icon?: React.ComponentType;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

export interface RowAction<T> extends BaseAction {
  type: "row";
  onClick?: (item: T, context?: ActionContext) => void;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

export interface BulkAction<T> extends BaseAction {
  type: "bulk";
  onClick?: (items: T[], context?: ActionContext) => void;
  appliesTo?: (item: T) => boolean;
  requiresAllRows?: boolean;
}
```

#### `@smbc/action-helpers`
**Purpose**: Pre-built action creators
```typescript
export function createBulkDeleteAction<T>(/* ... */) { /* ... */ }
export function createBulkUpdateAction<T>(/* ... */) { /* ... */ }
export function createOptimisticBulkUpdateAction<T>(/* ... */) { /* ... */ }
// ... other action helpers
```

### 3. Permission System

#### `@smbc/permissions`
**Purpose**: Permission checking and enforcement
```typescript
export interface PermissionChecker<T> {
  canView: (item: T, context: PermissionContext) => boolean;
  canEdit: (item: T, context: PermissionContext) => boolean;
  canDelete: (item: T, context: PermissionContext) => boolean;
  canCreate: (context: PermissionContext) => boolean;
}

export function createPermissionChecker<T>(
  rules: PermissionRules<T>
): PermissionChecker<T> {
  // Implementation
}

export function usePermissions<T>(
  items: T[],
  checker: PermissionChecker<T>,
  userContext: PermissionContext
) {
  // Returns permission state for items
}
```

### 4. Transaction System

#### `@smbc/transactions`
**Purpose**: Optimistic updates and rollback
```typescript
export interface TransactionManager<T> {
  addOperation: (op: TransactionOperation<T>) => string;
  executeAll: () => Promise<void>;
  rollback: (operationId: string) => void;
  clear: () => void;
}

export function useTransactionManager<T>(): TransactionManager<T> {
  // Implementation
}

export function createOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updateFn: (data: T[], update: Partial<T>) => T[]
) {
  // Optimistic update utilities
}
```

### 5. Activity Tracking

#### `@smbc/activity-tracking`
**Purpose**: User action logging and notifications
```typescript
export interface ActivityTracker {
  track: (event: ActivityEvent) => void;
  getRecentActivities: () => ActivityEvent[];
  subscribe: (callback: (event: ActivityEvent) => void) => () => void;
}

export function useActivityTracker(entityType: string): ActivityTracker {
  // Implementation
}

export interface ActivityEvent {
  id: string;
  entityType: string;
  entityId: string | number;
  action: "create" | "update" | "delete";
  userId: string;
  timestamp: Date;
  // ... activity details
}
```

### 6. Selection Management

#### `@smbc/selection`
**Purpose**: Multi-item selection state
```typescript
export interface SelectionManager<T> {
  selectedIds: (string | number)[];
  selectedItems: T[];
  isSelected: (id: string | number) => boolean;
  toggle: (id: string | number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelection: (ids: (string | number)[]) => void;
}

export function useSelection<T>(
  items: T[],
  getItemId: (item: T) => string | number
): SelectionManager<T> {
  // Implementation
}
```

### 7. UI Components

#### `@smbc/data-table`
**Purpose**: Table rendering (ag-grid wrapper)
```typescript
export interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  selection?: SelectionManager<T>;
  actions?: RowAction<T>[];
  // ... other props
}

export function DataTable<T>(props: DataTableProps<T>) {
  // ag-grid integration
}
```

#### `@smbc/data-forms`
**Purpose**: Form rendering and validation
```typescript
export interface DataFormProps<T> {
  mode: "create" | "edit";
  schema: DataSchema<T>;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void;
  // ... other props
}

export function DataForm<T>(props: DataFormProps<T>) {
  // Form implementation
}
```

#### `@smbc/action-bar`
**Purpose**: Action button rendering
```typescript
export interface ActionBarProps<T> {
  selectedItems: T[];
  actions: (BulkAction<T> | GlobalAction)[];
  permissions?: PermissionChecker<T>;
  // ... other props
}

export function ActionBar<T>(props: ActionBarProps<T>) {
  // Action bar implementation
}
```

### 8. Orchestration Layer

#### `@smbc/dataview` (Simplified)
**Purpose**: High-level composition and convenience
```typescript
// Re-exports from other packages
export * from '@smbc/data-core';
export * from '@smbc/data-client';
export * from '@smbc/action-core';
export * from '@smbc/permissions';
// ... etc

// High-level composition hook
export function useDataView<T>(config: DataViewConfig<T>) {
  const dataQuery = useDataQuery(config.api);
  const mutations = useDataMutations(config.api);
  const selection = useSelection(dataQuery.data, item => item[config.schema.primaryKey]);
  const permissions = usePermissions(dataQuery.data, config.permissions, userContext);
  const transactions = useTransactionManager<T>();
  const activityTracker = useActivityTracker(config.activity?.entityType);

  // Orchestrate all the pieces
  return {
    // ... composed result
  };
}
```

## Migration Strategy

### Phase 1: Extract Core Packages
1. Create `@smbc/data-core` with shared types
2. Create `@smbc/action-core` with action interfaces
3. Create `@smbc/permissions` with permission logic
4. Update existing dataview to use these packages internally

### Phase 2: Extract Feature Packages
1. Create `@smbc/transactions` and move transaction logic
2. Create `@smbc/activity-tracking` and move activity logic
3. Create `@smbc/selection` and move selection logic
4. Update dataview to compose these packages

### Phase 3: Extract UI Packages
1. Create `@smbc/data-table` with ag-grid wrapper
2. Create `@smbc/data-forms` with form components
3. Create `@smbc/action-bar` with action rendering
4. Update dataview to be primarily an orchestration layer

### Phase 4: Optimize and Cleanup
1. Remove unused code from dataview
2. Optimize bundle sizes for individual packages
3. Add proper tree-shaking support
4. Update documentation and examples

## Benefits of This Architecture

### For Developers
- **Focused APIs**: Each package has a single responsibility
- **Flexible Composition**: Use only what you need
- **Easier Testing**: Smaller, focused packages are easier to test
- **Better Type Safety**: More granular type definitions

### For Applications
- **Smaller Bundles**: Only include needed functionality
- **Better Performance**: Reduced memory footprint
- **Easier Debugging**: Clear separation of concerns
- **Incremental Adoption**: Migrate one feature at a time

### For Maintenance
- **Independent Versioning**: Packages can evolve separately
- **Clearer Dependencies**: Explicit package relationships
- **Easier Refactoring**: Changes are contained within packages
- **Better Documentation**: Each package can have focused docs

## Implementation Considerations

### Package Dependencies
```
@smbc/dataview (orchestration)
├── @smbc/data-client
│   └── @smbc/data-core
├── @smbc/data-table
│   ├── @smbc/data-core
│   ├── @smbc/action-core
│   └── @smbc/selection
├── @smbc/data-forms
│   └── @smbc/data-core
├── @smbc/action-bar
│   ├── @smbc/action-core
│   ├── @smbc/permissions
│   └── @smbc/selection
├── @smbc/action-helpers
│   ├── @smbc/action-core
│   └── @smbc/transactions
├── @smbc/transactions
│   └── @smbc/data-core
├── @smbc/permissions
│   └── @smbc/data-core
├── @smbc/activity-tracking
│   └── @smbc/data-core
└── @smbc/selection
    └── @smbc/data-core
```

### Backward Compatibility
- Keep current `@smbc/dataview` API working during migration
- Add deprecation warnings for old APIs
- Provide migration guides for each package
- Support both old and new APIs for at least 2 major versions

### Bundle Size Optimization
- Ensure tree-shaking works properly for each package
- Use ESM exports with sideEffects: false
- Minimize dependencies between packages
- Consider peer dependencies for React/React Query

### Testing Strategy
- Unit tests for each package in isolation
- Integration tests for package combinations
- End-to-end tests for full dataview functionality
- Performance benchmarks for bundle size impact

## Timeline Estimate

- **Phase 1**: 2-3 weeks (extract core packages)
- **Phase 2**: 3-4 weeks (extract feature packages)
- **Phase 3**: 4-5 weeks (extract UI packages)
- **Phase 4**: 2-3 weeks (optimization and cleanup)

**Total**: ~3-4 months with proper testing and documentation

This refactoring would provide a much more maintainable and flexible foundation for data management across the entire platform.