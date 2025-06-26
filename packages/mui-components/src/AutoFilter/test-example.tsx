/**
 * Test example showing AutoFilter with real API types
 * This file demonstrates how to use AutoFilter with the existing applet APIs
 */

import { AutoFilter, filterFieldPresets, createFilterField } from './index';

// Example: Using with User Management API types
// In a real implementation, you'd import from the generated types:
// import type { operations } from '@smbc/user-management-client/generated/types';

// Mock operation type that matches the real user-management API
type UsersListOperation = {
  parameters: {
    query?: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
  };
};

// Mock operation type that matches the real product-catalog API  
type ProductsListOperation = {
  parameters: {
    query?: {
      page?: number;
      pageSize?: number;
      category?: string;
      search?: string;
    };
  };
};

export function UserManagementFilterExample() {
  const handleFiltersChange = (filters: UsersListOperation['parameters']['query']) => {
    console.log('User filters changed:', filters);
    // In real usage: refetch({ ...filters });
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>User Management Filters (Auto-generated)</h3>
      
      <AutoFilter.fromOperation
        operationType={null as any as UsersListOperation}
        onFiltersChange={handleFiltersChange}
        title="User Filters"
        showClearButton={true}
        collapsible={true}
        config={{
          hidePagination: true, // Don't show page/pageSize in UI
          fieldOverrides: {
            search: {
              placeholder: 'Search users by name, email, or role...',
              fullWidth: true,
            },
          },
        }}
      />
    </div>
  );
}

export function ProductCatalogFilterExample() {
  const handleFiltersChange = (filters: ProductsListOperation['parameters']['query']) => {
    console.log('Product filters changed:', filters);
    // In real usage: refetch({ ...filters });
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Product Catalog Filters (Auto-generated)</h3>
      
      <AutoFilter.fromOperation
        operationType={null as any as ProductsListOperation}
        onFiltersChange={handleFiltersChange}
        title="Product Filters"
        showClearButton={true}
        config={{
          hidePagination: true,
          fieldOverrides: {
            search: {
              placeholder: 'Search products...',
              fullWidth: true,
            },
            category: {
              label: 'Product Category',
              options: [
                { value: '', label: 'All Categories' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'books', label: 'Books' },
                { value: 'home', label: 'Home & Garden' },
              ],
            },
          },
        }}
      />
    </div>
  );
}

export function ManualFilterExample() {
  const fields = [
    filterFieldPresets.search('query'),
    createFilterField('status', 'select', {
      label: 'Status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending Review' },
      ],
    }),
    createFilterField('priority', 'select', {
      label: 'Priority Level',
      options: [
        { value: '', label: 'Any Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'low', label: 'Low Priority' },
      ],
    }),
    createFilterField('minPrice', 'number', {
      label: 'Min Price',
      min: 0,
      placeholder: '0.00',
    }),
    createFilterField('maxPrice', 'number', {
      label: 'Max Price',
      min: 0,
      placeholder: '999.99',
    }),
    createFilterField('inStock', 'checkbox', {
      label: 'In Stock Only',
    }),
  ];

  const handleFiltersChange = (filters: any) => {
    console.log('Manual filters changed:', filters);
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Manual Filter Configuration</h3>
      
      <AutoFilter.fromFields
        fields={fields}
        onFiltersChange={handleFiltersChange}
        title="Advanced Filters"
        showClearButton={true}
        showFilterCount={true}
        collapsible={true}
        config={{
          layout: {
            direction: 'row',
            spacing: 2,
            wrap: true,
          },
        }}
      />
    </div>
  );
}

// Combined example showing all three approaches
export function AutoFilterShowcase() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1>AutoFilter Component Showcase</h1>
      <p>
        This demonstrates the AutoFilter component generating UI from OpenAPI specs
        and manual field configurations.
      </p>
      
      <UserManagementFilterExample />
      <ProductCatalogFilterExample />
      <ManualFilterExample />
      
      <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <h4>Usage Notes:</h4>
        <ul>
          <li>Open browser console to see filter change events</li>
          <li>Try different combinations of filters</li>
          <li>Notice how search fields are debounced automatically</li>
          <li>Pagination fields (page, pageSize) are hidden by default</li>
          <li>Clear button appears when filters are active</li>
        </ul>
      </div>
    </div>
  );
}