import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuiDataView } from '../src/MuiDataView';
import { Chip, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const meta: Meta<typeof MuiDataView.TableComponent> = {
  title: 'Components/MuiDataView',
  component: MuiDataView.TableComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Data table component with support for actions, selection, and loading states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    isActive: true,
    isAdmin: false,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    isActive: true,
    isAdmin: true,
    createdAt: '2023-02-20T14:45:00Z',
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    isActive: false,
    isAdmin: false,
    createdAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    firstName: 'Alice',
    lastName: 'Wilson',
    email: 'alice.wilson@example.com',
    isActive: true,
    isAdmin: false,
    createdAt: '2023-04-05T16:20:00Z',
  },
];

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (user: any) => `${user.firstName} ${user.lastName}`,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (user: any) => (
      <Chip
        label={user.isActive ? 'Active' : 'Inactive'}
        color={user.isActive ? 'success' : 'default'}
        size="small"
      />
    ),
  },
  {
    key: 'isAdmin',
    label: 'Admin',
    render: (user: any) => (
      <Chip
        label={user.isAdmin ? 'Yes' : 'No'}
        color={user.isAdmin ? 'primary' : 'default'}
        size="small"
      />
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (user: any) => new Date(user.createdAt).toLocaleDateString(),
  },
];

const actions = [
  {
    key: 'view',
    label: 'View',
    icon: Visibility,
    color: 'info' as const,
    onClick: (user: any) => console.log('View user:', user),
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: Edit,
    color: 'primary' as const,
    onClick: (user: any) => console.log('Edit user:', user),
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Delete,
    color: 'error' as const,
    onClick: (user: any) => console.log('Delete user:', user),
  },
];

export const BasicTable: Story = {
  args: {
    data: sampleUsers,
    columns,
    actions: [],
    isLoading: false,
    error: null,
  },
};

export const WithActions: Story = {
  args: {
    data: sampleUsers,
    columns,
    actions,
    isLoading: false,
    error: null,
  },
};

export const WithSelection: Story = {
  args: {
    data: sampleUsers,
    columns,
    actions,
    isLoading: false,
    error: null,
    selection: {
      enabled: true,
      selectedIds: ['1', '3'],
      onSelectionChange: (ids: string[]) => console.log('Selection changed:', ids),
    },
  },
};

export const LoadingState: Story = {
  args: {
    data: [],
    columns,
    actions,
    isLoading: true,
    error: null,
  },
};

export const ErrorState: Story = {
  args: {
    data: [],
    columns,
    actions,
    isLoading: false,
    error: new Error('Failed to load data'),
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns,
    actions,
    isLoading: false,
    error: null,
  },
};

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      firstName: `User${i + 1}`,
      lastName: `Last${i + 1}`,
      email: `user${i + 1}@example.com`,
      isActive: Math.random() > 0.3,
      isAdmin: Math.random() > 0.8,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    columns,
    actions,
    isLoading: false,
    error: null,
    selection: {
      enabled: true,
      selectedIds: [],
      onSelectionChange: (ids: string[]) => console.log('Selection changed:', ids),
    },
  },
};