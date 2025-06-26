# AutoFilter Examples

## Basic Usage with Generated Types

```typescript
import { AutoFilter } from '@smbc/mui-components';
import type { operations } from './generated/types'; // from openapi-typescript

function UserManagement() {
  // Type-safe filter generation from OpenAPI operation
  const handleFiltersChange = (filters: operations['Users_list']['parameters']['query']) => {
    console.log('Filters:', filters);
    // Use filters for API call
    refetch(filters);
  };

  return (
    <AutoFilter.fromOperation
      operationType={null as any as operations['Users_list']}
      onFiltersChange={handleFiltersChange}
      title="User Filters"
      showClearButton={true}
      collapsible={true}
    />
  );
}
```

## With URL Synchronization

```typescript
import { useAutoFilterWithUrlFromOperation } from '@smbc/mui-components';
import { useHashQueryParams } from '@smbc/react-foundation';
import type { operations } from './generated/types';

function ProductCatalog() {
  const {
    values,
    onFiltersChange,
    clearFilters,
    getActiveFilterCount,
    getCleanedValues,
  } = useAutoFilterWithUrlFromOperation<operations['Products_list']>(
    null as any as operations['Products_list'],
    {
      defaultValues: { page: 1, pageSize: 10 },
      useHashQueryParams,
      config: {
        hidePagination: true, // Don't show page/pageSize in UI
        excludeFields: ['sortBy'], // Hide sort from filters
      },
    }
  );

  // Use cleaned values for API calls
  const { data, refetch } = useQuery({
    queryKey: ['products', getCleanedValues()],
    queryFn: () => fetchProducts(getCleanedValues()),
  });

  return (
    <>
      <AutoFilter.fromOperation
        operationType={null as any as operations['Products_list']}
        values={values}
        onFiltersChange={onFiltersChange}
        config={{
          fieldOverrides: {
            category: {
              options: [
                { value: 'electronics', label: 'Electronics' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'books', label: 'Books' },
              ],
            },
          },
        }}
      />
      
      <ProductTable 
        data={data} 
        filterCount={getActiveFilterCount()}
        onClearFilters={clearFilters}
      />
    </>
  );
}
```

## Manual Field Configuration

```typescript
import { AutoFilter, filterFieldPresets, createFilterField } from '@smbc/mui-components';

function CustomFilters() {
  const fields = [
    filterFieldPresets.search('query'),
    createFilterField('status', 'select', {
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    }),
    createFilterField('priority', 'select', {
      options: [
        { value: 'high', label: 'High Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'low', label: 'Low Priority' },
      ],
    }),
    filterFieldPresets.dateRange('createdAfter'),
  ];

  return (
    <AutoFilter.fromFields
      fields={fields}
      onFiltersChange={(filters) => console.log(filters)}
      config={{
        layout: {
          direction: 'row',
          spacing: 2,
          maxFieldsPerRow: 3,
        },
      }}
    />
  );
}
```

## Advanced Configuration

```typescript
import { AutoFilter, useAutoFilterFromOperation } from '@smbc/mui-components';

function AdvancedFilters() {
  const config = {
    // Only show specific fields
    includeFields: ['search', 'category', 'status'],
    
    // Override specific field configurations
    fieldOverrides: {
      search: {
        placeholder: 'Search products...',
        fullWidth: true,
        debounceMs: 500,
      },
      category: {
        label: 'Product Category',
        options: [
          { value: 'all', label: 'All Categories' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
        ],
      },
      status: {
        type: 'checkbox' as const,
        label: 'Active Only',
      },
    },
    
    // Layout configuration
    layout: {
      direction: 'row' as const,
      spacing: 3,
      wrap: true,
    },
    
    // Hide common fields
    hidePagination: true,
    hideSort: true,
  };

  return (
    <AutoFilter.fromOperation
      operationType={null as any as operations['Products_list']}
      onFiltersChange={handleChange}
      config={config}
      collapsible={true}
      defaultCollapsed={false}
      showFilterCount={true}
    />
  );
}
```

## With React Query Integration

```typescript
import { useAutoFilterWithUrlFromOperation } from '@smbc/mui-components';
import { useQuery } from '@tanstack/react-query';
import { useHashQueryParams } from '@smbc/react-foundation';

function DataTable() {
  const {
    values,
    onFiltersChange,
    getCleanedValues,
  } = useAutoFilterWithUrlFromOperation<operations['Users_list']>(
    null as any as operations['Users_list'],
    {
      defaultValues: { page: 1, pageSize: 25 },
      useHashQueryParams,
    }
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', getCleanedValues()],
    queryFn: () => api.getUsers(getCleanedValues()),
    keepPreviousData: true,
  });

  return (
    <>
      <AutoFilter.fromOperation
        operationType={null as any as operations['Users_list']}
        values={values}
        onFiltersChange={onFiltersChange}
      />
      
      {isLoading ? (
        <LoadingTable />
      ) : (
        <UsersTable data={data?.users} />
      )}
    </>
  );
}
```

## Standalone URL Filter Management

```typescript
import { useUrlFilters } from '@smbc/mui-components';
import { useHashQueryParams } from '@smbc/react-foundation';

function CustomFilterUI() {
  const {
    values,
    setFilter,
    setFilters,
    clearFilters,
    getCleanedValues,
  } = useUrlFilters(
    { search: '', category: '', page: 1 },
    useHashQueryParams
  );

  return (
    <div>
      <TextField
        value={values.search}
        onChange={(e) => setFilter('search', e.target.value)}
        placeholder="Search..."
      />
      
      <Select
        value={values.category}
        onChange={(e) => setFilter('category', e.target.value)}
      >
        <MenuItem value="">All Categories</MenuItem>
        <MenuItem value="electronics">Electronics</MenuItem>
        <MenuItem value="clothing">Clothing</MenuItem>
      </Select>
      
      <Button onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
```

## Field Type Examples

AutoFilter automatically maps OpenAPI schemas to appropriate input types:

- `string` → `TextField`
- `string` with `enum` → `Select` dropdown
- `string` with name containing "search" → `SearchInput` with debouncing
- `integer`/`number` → `TextField` with `type="number"`
- `boolean` → `Checkbox`
- Pagination fields (`page`, `pageSize`) → Hidden by default
- Sort fields → `Select` with ascending/descending options

## Type Safety

The AutoFilter system is fully type-safe when used with generated OpenAPI types:

```typescript
// This is type-checked against the actual API operation
type UserFilters = operations['Users_list']['parameters']['query'];

const handleFiltersChange = (filters: UserFilters) => {
  // filters.search is string | undefined
  // filters.page is number | undefined
  // filters.role is string | undefined (if defined in OpenAPI)
};
```