# DataView System Example

This demonstrates how to use the new DataView abstraction to create declarative CRUD interfaces.

## Basic Usage

```tsx
import React from 'react';
import { useDataView, DataViewConfig } from '@smbc/applet-core';
import { MuiDataViewRenderer } from '@smbc/mui-components';
import { apiClient } from '@smbc/user-management-client';

// Define your data type
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// Configure your DataView
const userDataViewConfig: DataViewConfig<User> = {
  // API configuration
  api: {
    endpoint: '/users',
    client: apiClient,
  },

  // Data schema
  schema: {
    fields: [
      { name: 'firstName', type: 'string', label: 'First Name', required: true },
      { name: 'lastName', type: 'string', label: 'Last Name', required: true },
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'isActive', type: 'boolean', label: 'Active', required: false },
    ],
    primaryKey: 'id',
    displayName: (user) => `${user.firstName} ${user.lastName}`,
  },

  // Table columns
  columns: [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (user) => user.isActive ? 'Active' : 'Inactive' 
    },
    { key: 'createdAt', label: 'Created', render: (user) => new Date(user.createdAt).toLocaleDateString() },
  ],

  // Filters
  filters: {
    fields: [
      { name: 'search', type: 'search', label: 'Search users...', placeholder: 'Search users...', fullWidth: true },
      { name: 'email', type: 'text', label: 'Email Filter', placeholder: 'Filter by email...' },
      { 
        name: 'status', 
        type: 'select', 
        label: 'Status',
        options: [
          { label: 'All Statuses', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ]
      },
    ],
    initialValues: { search: '', email: '', status: '' },
    title: 'User Filters',
    collapsible: true,
    showClearButton: true,
  },

  // Actions
  actions: [
    {
      key: 'edit',
      label: 'Edit',
      color: 'primary',
      onClick: (user) => console.log('Edit user:', user),
    },
    {
      key: 'delete',
      label: 'Delete',
      color: 'error',
      onClick: (user) => console.log('Delete user:', user),
    },
  ],

  // Forms for create/edit
  forms: {
    create: {
      fields: [
        { name: 'firstName', type: 'string', label: 'First Name', required: true },
        { name: 'lastName', type: 'string', label: 'Last Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
      ],
      title: 'Create New User',
    },
    edit: {
      fields: [
        { name: 'firstName', type: 'string', label: 'First Name', required: true },
        { name: 'lastName', type: 'string', label: 'Last Name', required: true },
        { name: 'isActive', type: 'boolean', label: 'Active' },
      ],
      title: 'Edit User',
    },
  },

  // Use MUI renderer
  renderer: MuiDataViewRenderer,

  // Pagination
  pagination: {
    enabled: true,
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },
};

// Use in your component
export function UserManagementDataView() {
  const dataView = useDataView(userDataViewConfig);

  return (
    <div>
      {/* Filters */}
      <dataView.FilterComponent />
      
      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div />
        <button onClick={dataView.handleCreate}>
          Add User
        </button>
      </div>

      {/* Main table */}
      <dataView.TableComponent />

      {/* Pagination */}
      <dataView.PaginationComponent 
        page={dataView.pagination.page}
        pageSize={dataView.pagination.pageSize}
        total={dataView.pagination.total}
        onPageChange={(page) => dataView.setPagination({ page })}
        onPageSizeChange={(pageSize) => dataView.setPagination({ pageSize, page: 0 })}
      />

      {/* Create form dialog */}
      {dataView.createDialogOpen && <dataView.CreateFormComponent />}

      {/* Edit form dialog */}
      {dataView.editDialogOpen && dataView.editingItem && (
        <dataView.EditFormComponent item={dataView.editingItem} />
      )}
    </div>
  );
}
```

## Even Simpler with DataViewApplet

```tsx
import React from 'react';
import { DataViewApplet } from '@smbc/applet-core';

export function SimpleUserManagement() {
  return (
    <DataViewApplet config={userDataViewConfig} />
  );
}
```

## Benefits

1. **Declarative**: Define your CRUD interface with configuration instead of imperative code
2. **Type-safe**: Full TypeScript support for your data models
3. **Reusable**: Same configuration works with different renderers (MUI, AG-Grid, etc.)
4. **URL-synced**: Filters and pagination automatically sync with URL parameters
5. **Consistent**: All CRUD operations follow the same patterns
6. **Less code**: Reduces ~750 lines of UserTable to ~50 lines of configuration

## Next Steps

1. Update existing UserTable to use DataView system
2. Create additional renderers (AG-Grid, etc.)
3. Add more advanced features (bulk operations, export, etc.)
4. Add validation and error handling
5. Create templates for common use cases