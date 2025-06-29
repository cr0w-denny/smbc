import type { Meta, StoryObj } from '@storybook/react';
import { ActionBar } from '../src/ActionBar/ActionBar';
import { BulkAction, GlobalAction } from '@smbc/react-dataview';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Block as BlockIcon, CheckCircle as ActivateIcon } from '@mui/icons-material';

const meta = {
  title: 'Components/ActionBar',
  component: ActionBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ActionBar provides a toolbar with left/right sections for different types of actions. Left side shows bulk actions when items are selected, right side shows global actions that are always available.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample user data for examples
const sampleUsers = [
  { id: 1, name: 'John Doe', isActive: true, role: 'admin' },
  { id: 2, name: 'Jane Smith', isActive: false, role: 'user' },
  { id: 3, name: 'Bob Wilson', isActive: true, role: 'user' },
];

// Global actions that are always visible
const globalActions: GlobalAction[] = [
  {
    type: 'global',
    key: 'create',
    label: 'Create User',
    icon: AddIcon,
    color: 'primary',
    onClick: () => console.log('Create user clicked'),
  },
];

// Bulk actions that appear when items are selected
const bulkActions: BulkAction<typeof sampleUsers[0]>[] = [
  {
    type: 'bulk',
    key: 'bulk-edit',
    label: 'Edit Selected',
    icon: EditIcon,
    color: 'primary',
    onClick: (users) => console.log('Bulk edit users:', users),
  },
  {
    type: 'bulk',
    key: 'bulk-activate',
    label: 'Activate Selected',
    icon: ActivateIcon,
    color: 'success',
    onClick: (users) => console.log('Bulk activate users:', users),
    appliesTo: (user) => !user.isActive,
    requiresAllRows: false,
  },
  {
    type: 'bulk',
    key: 'bulk-deactivate',
    label: 'Deactivate Selected',
    icon: BlockIcon,
    color: 'warning',
    onClick: (users) => console.log('Bulk deactivate users:', users),
    appliesTo: (user) => user.isActive,
    requiresAllRows: false,
  },
  {
    type: 'bulk',
    key: 'bulk-delete',
    label: 'Delete Selected',
    icon: DeleteIcon,
    color: 'error',
    onClick: (users) => console.log('Bulk delete users:', users),
  },
];

export const Default: Story = {
  args: {
    globalActions,
    bulkActions,
    selectedItems: [],
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
};

export const WithSelection: Story = {
  args: {
    globalActions,
    bulkActions,
    selectedItems: [sampleUsers[0], sampleUsers[1]], // Select first two users
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
};

export const WithConditionalActions: Story = {
  args: {
    globalActions,
    bulkActions,
    selectedItems: [sampleUsers[1]], // Select inactive user
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how bulk actions can be conditionally displayed based on selected items. Only "Activate Selected" appears because the selected user is inactive.',
      },
    },
  },
};

export const MixedSelection: Story = {
  args: {
    globalActions,
    bulkActions,
    selectedItems: [sampleUsers[0], sampleUsers[1]], // Select active and inactive user
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows bulk actions when both active and inactive users are selected. Both "Activate Selected" and "Deactivate Selected" appear because at least one user can be affected by each action.',
      },
    },
  },
};

export const GlobalActionsOnly: Story = {
  args: {
    globalActions,
    bulkActions: [],
    selectedItems: [],
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'ActionBar with only global actions, no bulk actions available.',
      },
    },
  },
};

export const NoActions: Story = {
  args: {
    globalActions: [],
    bulkActions: [],
    selectedItems: [],
    totalItems: sampleUsers.length,
    onClearSelection: () => console.log('Clear selection clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'ActionBar with no actions - shows minimal state.',
      },
    },
  },
};