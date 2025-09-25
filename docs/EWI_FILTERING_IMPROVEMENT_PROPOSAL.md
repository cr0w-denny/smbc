# EWI Events Filtering Improvement Proposal

## Problem Statement

The EWI Events applet has overly complex filtering logic (893 lines in Events.tsx) due to:

1. **Parameter Transformation Complexity**: Manual conversions between arrays↔CSV, booleans↔strings for URL serialization
2. **Duplicate Filtering Logic**: Both custom client-side filtering AND AG Grid's built-in filtering enabled
3. **Complex State Management**: Separate state for UI filters vs applied filters with manual synchronization
4. **Hash Navigation Constraints**: Write-only after mount to prevent render loops
5. **Apply/Reset Button Logic**: Manual change detection and state management

**Key Discovery**: AG Grid already handles client-side filtering (`filter: true` on all columns), making the manual `workflow` and `category` filtering redundant!

**Current Architecture Issues:**
- Only 2 fields (`workflow`, `category`) are manually filtered client-side when AG Grid could handle them
- 150+ lines of parameter transformation code for URL serialization
- Complex `useEvents` hook mixing server filtering with unnecessary client filtering
- Separate state management for UI vs applied parameters

## Proposed Solutions

### Option 1: Eliminate Redundant Client-Side Filtering

**Simplest Fix**: Remove manual client-side filtering and let AG Grid handle it:

```typescript
// BEFORE: Manual filtering (unnecessary!)
const data = React.useMemo(() => {
  let filteredEvents = query.data || [];

  if (params.workflow) {
    filteredEvents = filteredEvents.filter(
      (event: Event) => event.workflow_status === params.workflow,
    );
  }

  if (params.category) {
    filteredEvents = filteredEvents.filter(
      (event: Event) => event.event_category === params.category,
    );
  }

  return { events: filteredEvents };
}, [query.data, params.workflow, params.category]);

// AFTER: Just use AG Grid filtering (it's already enabled!)
const { data } = useEvents(serverParams); // Only server filters

// AG Grid handles workflow_status and event_category filtering automatically
<AgGridReact
  rowData={data?.events || []}
  defaultColDef={{ filter: true }} // Already there!
/>
```

**Benefits:**
- Eliminates ~50 lines of unnecessary filtering code
- Users get richer filtering (contains, starts with, etc.) instead of exact match
- Consistent UX with other AG Grid features
- No manual state management for client filters

**Remaining Problem**: Still need server filter management with apply/reset functionality

### Option 2: Server-Only Filter Hook

Since client-side filtering is handled by AG Grid, focus purely on server filter management:

```typescript
const useServerFiltering = ({
  defaultParams,
  arrayFields = [],    // Fields that are arrays internally, CSV in URL
  booleanFields = [],  // Fields that are booleans internally, strings in URL
}) => {
  // Returns:
  // - filterValues: Current UI state (proper types)
  // - serverParams: Applied server parameters (for API)
  // - setFilterValues: Update UI state
  // - applyFilters: Apply current UI state to server
  // - resetFilters: Reset to defaults
  // - hasChanges: UI differs from applied state
}

// Usage - much simpler:
const EventsGrid = () => {
  const {
    filterValues,
    serverParams,
    setFilterValues,
    applyFilters,
    resetFilters,
    hasChanges
  } = useServerFiltering({
    defaultParams: { dateFrom: '...', dateTo: '...', status: '', types: [] },
    arrayFields: ['types'],
    booleanFields: ['my']
  });

  const { data } = useEvents(serverParams); // Clean server-only hook

  return (
    <FilterBar
      values={filterValues}
      onValuesChange={setFilterValues}
      onApply={applyFilters}
      onReset={resetFilters}
      hasChanges={hasChanges}
    />
    <AgGridReact rowData={data?.events} /> {/* AG Grid handles the rest */}
  );
};
```

**Benefits:**
- Dramatically simpler - only handles server filtering
- Eliminates parameter transformation complexity
- Clean separation: server filters vs AG Grid client filters
- Reusable across applets with server filtering needs

### Option 3: Filtering Utilities + Pattern Library

Create utility functions and document patterns instead of new components:

```typescript
// Filtering utilities
export const createFilterTransformations = (config: FilterConfig) => ({
  toUrl: (params: any) => transformParamsForUrl(params, config),
  fromUrl: (urlParams: any) => transformUrlParams(urlParams, config),
  toServer: (params: any) => transformParamsForServer(params, config),
  toClient: (params: any) => transformParamsForClient(params, config),
});

export const useFilterState = (config: FilterConfig) => {
  // Manages complex filter state with transformations
};

// Usage patterns documented with examples
```

**Pros:**
- Flexible approach that works with existing components
- Easy to adopt incrementally
- Clear separation of concerns

**Cons:**
- Requires more setup code in each applet
- Pattern consistency depends on developer discipline

## Recommended Approach: Option 1 + 2 Combined

**Phase 1: Eliminate Redundant Client Filtering**
Remove manual `workflow` and `category` filtering - let AG Grid handle it:

```typescript
// REMOVE this entire useMemo block (lines 85-107):
const data = React.useMemo(() => {
  const allEvents = query.data || [];
  let filteredEvents = allEvents;

  if (params.workflow) {
    filteredEvents = filteredEvents.filter(
      (event: Event) => event.workflow_status === params.workflow,
    );
  }

  if (params.category) {
    filteredEvents = filteredEvents.filter(
      (event: Event) => event.event_category === params.category,
    );
  }

  return { events: filteredEvents };
}, [query.data, params.workflow, params.category]);
```

**Phase 2: Simplify with Server-Only Hook**
Replace complex parameter management with focused server filtering:

```typescript
// Before: 893 lines with complex state management
// After: ~200 lines (estimated)

const EventsGrid = () => {
  const {
    filterValues,
    serverParams,
    setFilterValues,
    applyFilters,
    resetFilters,
    hasChanges
  } = useServerFiltering({
    defaultParams: {
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      status: '',
      types: []
    },
    arrayFields: ['types'],
  });

  const { data, isLoading, error } = useEvents(serverParams);

  return (
    <AppShell.Toolbar>
      <FilterBar
        values={filterValues}
        onValuesChange={setFilterValues}
        onApply={applyFilters}
        hasChanges={hasChanges}
      />
    </AppShell.Toolbar>
    <AgGridReact
      rowData={data?.events || []}
      // AG Grid handles workflow_status, event_category filtering automatically
    />
  );
};
```

**Phase 3: Create Best Practices Documentation**
Document the improved patterns with examples for:
- Server/client filtering splits
- Complex parameter transformations
- Reset functionality
- URL synchronization patterns

## Implementation Plan

1. **Week 1**: Enhance `useHashNavigationWithApply` hook with smart filtering capabilities
2. **Week 2**: Refactor EWI Events to use the enhanced hook
3. **Week 3**: Test, refine, and document patterns
4. **Week 4**: Apply patterns to other complex filtering scenarios (user-management, etc.)

## Success Metrics

- **Code Reduction**: EWI Events component reduced from 893 to ~300 lines
- **Maintainability**: Clear separation of server/client filtering concerns
- **Reusability**: Other applets can use the same patterns
- **Developer Experience**: Less boilerplate for complex filtering scenarios

## Open Questions

1. Should we maintain backward compatibility with existing `useHashNavigationWithApply`?
2. How do we handle edge cases like dependent filters (e.g., category affects available options)?
3. Should the enhanced hook be framework-agnostic or MUI-specific?

## Option 4: Clean Slate - Ideal World Solution

If we ignore current implementations and design from scratch, here's the optimal architecture:

### Core Principle: Declarative Filter Configuration

```typescript
// Single source of truth for all filtering logic
const ewiEventsFilterConfig = createFilterConfig({
  // Define all filters with their behavior
  filters: {
    dateFrom: {
      type: "date",
      label: "From",
      target: "server",
      urlKey: "dateFrom",
    },
    dateTo: {
      type: "date",
      label: "To",
      target: "server",
      urlKey: "dateTo",
    },
    status: {
      type: "select",
      label: "Status",
      target: "server",
      urlKey: "status",
      options: [
        { label: "Any Status", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    types: {
      type: "multiselect",
      label: "Types",
      target: "server",
      urlKey: "types",
      urlFormat: "csv", // Handle array <-> CSV conversion
      options: [
        { label: "ExRatings", value: "ExRatings" },
        { label: "Stock", value: "Stock" },
        { label: "CDS Spreads", value: "CDSSpreads" },
      ],
    },
    workflow: {
      type: "select",
      label: "Workflow Status",
      target: "client", // Applied client-side after data fetch
      urlKey: "workflow",
      options: [
        { label: "Any", value: "" },
        { label: "Subscribed", value: "Subscribed" },
        { label: "Review", value: "Review" },
      ],
    },
    category: {
      type: "select",
      label: "Category",
      target: "client",
      urlKey: "category",
      options: [
        { label: "All", value: "" },
        { label: "Discretionary", value: "Discretionary" },
        { label: "Mandatory", value: "Mandatory" },
      ],
    },
    my: {
      type: "checkbox",
      label: "My Events",
      target: "client",
      urlKey: "my",
      urlFormat: "boolean", // Handle boolean <-> string conversion
    },
  },
  defaults: {
    dateFrom: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: () => new Date().toISOString().split('T')[0],
  },
  resetKeys: ["dateFrom", "dateTo"], // Fields to reset to defaults, others to empty
});
```

### Unified Filtering Hook

```typescript
const useUnifiedFiltering = (config: FilterConfig) => {
  // Returns everything needed with zero boilerplate:
  return {
    // UI Components
    FilterBar: <FilterBarComponent />, // Pre-configured component
    ResetButton: <ResetButtonComponent />, // Pre-configured reset

    // Data
    serverParams: Record<string, any>, // Ready for API calls
    clientFilter: (data: any[]) => any[], // Function to filter data

    // State
    hasChanges: boolean,
    isLoading: boolean,

    // Actions
    applyFilters: () => void,
    resetFilters: () => void,

    // For manual control (if needed)
    uiValues: Record<string, any>,
    setUiValue: (key: string, value: any) => void,
  };
};
```

### Ideal Component Usage

```typescript
const EventsGrid = () => {
  const filtering = useUnifiedFiltering(ewiEventsFilterConfig);

  // Simple data fetching - hook handles all server params
  const { data, isLoading, error } = useEvents(filtering.serverParams);

  // Simple client filtering - hook provides the function
  const filteredData = useMemo(() =>
    filtering.clientFilter(data?.events || []),
    [data, filtering.clientFilter]
  );

  return (
    <>
      <AppShell.Toolbar variant="extended">
        <Width>
          {filtering.FilterBar}
          <ActionBar
            onReset={filtering.resetFilters}
            hasChanges={filtering.hasChanges}
            onApply={filtering.applyFilters}
          />
        </Width>
      </AppShell.Toolbar>

      <AppShell.Page>
        <DataGrid data={filteredData} loading={filtering.isLoading || isLoading} />
      </AppShell.Page>
    </>
  );
};
```

### Key Benefits of Clean Slate Design

1. **Single Source of Truth**: All filtering logic in one declarative config
2. **Zero Boilerplate**: Hook provides everything pre-configured
3. **Type Safety**: Config generates types for all filter values
4. **URL Sync**: Automatic serialization/deserialization based on config
5. **No State Management**: Hook handles all complex state internally
6. **Composable**: Can combine multiple filter configs if needed
7. **Testable**: Config and hook are easily unit testable

### Advanced Features

```typescript
// Dependent filters
const configWithDependencies = createFilterConfig({
  filters: {
    region: {
      type: "select",
      label: "Region",
      target: "server",
      options: regions,
    },
    office: {
      type: "select",
      label: "Office",
      target: "server",
      dependsOn: "region", // Options change based on region
      optionsResolver: (values) => getOfficesForRegion(values.region),
    },
  },
});

// Custom validation
const configWithValidation = createFilterConfig({
  filters: {
    dateFrom: { type: "date", label: "From", target: "server" },
    dateTo: { type: "date", label: "To", target: "server" },
  },
  validation: {
    crossField: (values) => {
      if (values.dateFrom && values.dateTo && values.dateFrom > values.dateTo) {
        return { dateFrom: "Start date must be before end date" };
      }
      return {};
    },
  },
});
```

### Implementation Requirements

1. **Configuration Schema**: Define TypeScript interfaces for filter configs
2. **URL Serialization**: Automatic handling of arrays, booleans, dates, etc.
3. **Component Generation**: Auto-generate filter UI from config
4. **State Management**: Internal state machine handling apply/reset/change detection
5. **Framework Integration**: Seamless integration with existing navigation hooks
6. **Performance**: Optimized with proper memoization and change detection

This clean slate approach would reduce the EWI Events component from 893 lines to approximately **50-80 lines**, while being completely reusable and type-safe.

## Option 5: Perfect World - Zero Configuration

What if filtering required literally zero setup? Pure magic through convention and inference:

### The Dream: No Configuration At All

```typescript
// The entire EWI Events component:
const EventsGrid = () => {
  const { data, FilterBar, resetFilters } = useSmartQuery({
    queryKey: "events",
    endpoint: "/events",
    // That's it. Everything else is inferred.
  });

  return (
    <AppShell.Toolbar>
      {FilterBar} {/* Auto-generated from API schema */}
      <Button onClick={resetFilters}>Reset</Button>
    </AppShell.Toolbar>

    <DataGrid data={data} /> {/* Auto-filtered */}
  );
};
```

### How It Works: Pure Inference

1. **API Schema Analysis**: Read OpenAPI spec to understand all available filters
   ```yaml
   # From @smbc/ewi-events-api OpenAPI spec
   /events:
     get:
       parameters:
         - name: start_date    # → Auto-creates "From Date" filter
         - name: end_date      # → Auto-creates "To Date" filter
         - name: status        # → Auto-creates "Status" select with enum values
         - name: types         # → Auto-creates "Types" multiselect
   ```

2. **Data Shape Analysis**: Examine returned data to infer client-side filters
   ```typescript
   // Hook analyzes first API response:
   {
     "events": [
       {
         "workflow_status": "Review",     // → Auto-creates "Workflow" filter
         "event_category": "Mandatory",   // → Auto-creates "Category" filter
         "assigned_to_me": true           // → Auto-creates "My Events" checkbox
       }
     ]
   }
   ```

3. **Convention-Based Behavior**:
   - Date fields ending in `_date` → Date pickers
   - Fields with enum/limited values → Select dropdowns
   - Boolean fields → Checkboxes
   - Array parameters → Multiselect
   - Anything with "my", "mine", "assigned" → Checkbox filters
   - Server parameters (in API schema) → Trigger API calls
   - Client fields (only in response data) → Client-side filtering

4. **Smart Defaults**:
   - Date ranges default to "last 30 days"
   - Selects default to "All"
   - URL sync happens automatically
   - Reset clears everything to defaults
   - Apply button appears only when server filters change

### Even More Perfect: AI-Powered

```typescript
// AI analyzes usage patterns and suggests optimal filters
const EventsGrid = () => {
  const { data, FilterBar } = useAIQuery({
    queryKey: "events",
    endpoint: "/events",
    // AI learns from user behavior across all applets
    // and suggests the most useful filters automatically
  });

  // AI notices users frequently filter by:
  // 1. Date ranges (always needed)
  // 2. Status (high usage)
  // 3. "My items" (personal relevance)
  // 4. Types (when dealing with large datasets)
  // And auto-generates exactly those filters in optimal order

  return <AppShell><FilterBar /><DataGrid data={data} /></AppShell>;
};
```

### The Ultimate: Natural Language

```typescript
const EventsGrid = () => {
  return (
    <SmartDataView
      query="Show me EWI events from the last month that need my attention"
      // Converts natural language to:
      // - endpoint: "/events"
      // - filters: { dateFrom: "30 days ago", assigned_to_me: true }
      // - UI: Appropriate filter controls
    />
  );
};
```

### Why This Is Actually Possible

1. **OpenAPI Schemas**: We already have comprehensive API documentation
2. **TypeScript Types**: Generated types contain all the information needed
3. **Usage Analytics**: Could track which filters are actually used
4. **Convention Patterns**: Consistent naming across APIs enables inference
5. **ML/AI**: Modern LLMs could analyze schemas and suggest optimal UIs

### Implementation Strategy

```typescript
// Phase 1: Schema-driven generation
const useSchemaBasedFiltering = (apiSpec: OpenAPISpec, endpoint: string) => {
  // Analyze API schema to auto-generate filter configs
  // No manual configuration required
};

// Phase 2: Data-driven enhancement
const useDataInferredFiltering = (apiData: any[]) => {
  // Analyze response data to infer additional client filters
  // Automatically detect enum-like fields, boolean patterns, etc.
};

// Phase 3: Usage-optimized
const useSmartFiltering = (context: { apiSpec, userData, usageMetrics }) => {
  // Combine schema, data, and usage patterns
  // Generate optimal filter UIs automatically
};
```

This perfect world solution would reduce EWI Events from 893 lines to approximately **15-20 lines** - just the essential business logic with everything else automated through intelligent inference.

## Alternative Considerations

- **ag-Grid Integration**: Could we leverage ag-Grid's built-in filtering more effectively?
- **React Query Integration**: Better caching strategies for filtered data?
- **Type Safety**: How do we ensure type safety across all the parameter transformations?