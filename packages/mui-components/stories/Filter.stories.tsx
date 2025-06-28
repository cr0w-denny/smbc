import type { Meta, StoryObj } from '@storybook/react-vite';
import { Filter } from '../src/Filter/Filter';
import { useState } from 'react';

const meta: Meta<typeof Filter> = {
  title: 'Components/Filter',
  component: Filter,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible filter component that supports various field types and real-time filtering.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const FilterWithState = ({ spec }: { spec: any }) => {
  const [filters, setFilters] = useState(spec.initialValues || {});
  
  return (
    <div>
      <Filter
        spec={spec}
        values={filters}
        onFiltersChange={setFilters}
      />
      <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <strong>Current Filter Values:</strong>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
};

export const BasicFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: 'search',
            type: 'search',
            label: 'Search',
            placeholder: 'Search items...',
            fullWidth: true,
          },
          {
            name: 'category',
            type: 'select',
            label: 'Category',
            options: [
              { label: 'All Categories', value: '' },
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
              { label: 'Books', value: 'books' },
            ],
          },
          {
            name: 'active',
            type: 'boolean',
            label: 'Active Only',
          },
        ],
        initialValues: {
          search: '',
          category: '',
          active: false,
        },
        title: 'Product Filters',
        showClearButton: true,
        showFilterCount: true,
      }}
    />
  ),
};

export const UserManagementFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: 'search',
            type: 'search',
            label: 'Search users...',
            placeholder: 'Search users...',
            fullWidth: true,
          },
          {
            name: 'email',
            type: 'text',
            label: 'Email Filter',
            placeholder: 'Filter by email...',
          },
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
          {
            name: 'sortBy',
            type: 'select',
            label: 'Sort By',
            options: [
              { label: 'First Name', value: 'firstName' },
              { label: 'Last Name', value: 'lastName' },
              { label: 'Email', value: 'email' },
              { label: 'Created Date', value: 'createdAt' },
            ],
            defaultValue: 'firstName',
            excludeFromCount: true,
          },
          {
            name: 'sortOrder',
            type: 'select',
            label: 'Sort Order',
            options: [
              { label: 'Ascending', value: 'asc' },
              { label: 'Descending', value: 'desc' },
            ],
            defaultValue: 'asc',
            excludeFromCount: true,
          },
          {
            name: 'showDetails',
            type: 'checkbox',
            label: 'Show Details',
            defaultValue: false,
          },
        ],
        initialValues: {
          search: '',
          email: undefined,
          status: undefined,
          sortBy: 'firstName',
          sortOrder: 'asc',
          showDetails: false,
        },
        title: 'User Filters',
        collapsible: true,
        defaultCollapsed: false,
        showClearButton: true,
        showFilterCount: true,
        debounceMs: 300,
      }}
    />
  ),
};

export const CollapsibleFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Name',
            placeholder: 'Enter name...',
          },
          {
            name: 'priority',
            type: 'select',
            label: 'Priority',
            options: [
              { label: 'All Priorities', value: '' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
          {
            name: 'completed',
            type: 'checkbox',
            label: 'Completed Only',
          },
        ],
        initialValues: {
          name: '',
          priority: '',
          completed: false,
        },
        title: 'Task Filters',
        collapsible: true,
        defaultCollapsed: true,
        showClearButton: true,
        showFilterCount: true,
      }}
    />
  ),
};

export const MinimalFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: 'q',
            type: 'search',
            label: 'Search',
            placeholder: 'Type to search...',
            fullWidth: true,
          },
        ],
        initialValues: {
          q: '',
        },
        showClearButton: false,
        showFilterCount: false,
      }}
    />
  ),
};