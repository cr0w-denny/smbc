# React DataView with Transaction System

React hook for building data views with advanced transaction support, optimistic updates, and visual state management.

## Table of Contents

- [Quick Start](#quick-start)
- [Transaction System](#transaction-system)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

```tsx
import { useDataView } from '@smbc/react-dataview';

function TasksTable() {
  const dataView = useDataView({
    api: { client: apiClient, endpoint: '/api/tasks' },
    schema: { primaryKey: 'id', fields: [...] },
    columns: [...],
    actions: { bulk: [...], row: [...] }
  }, {
    transaction: {
      enabled: true,
      mode: 'user-controlled',
      showPendingIndicator: true
    }
  });

  return <dataView.TableComponent />;
}
```

## Transaction System

The transaction system provides **optimistic UI updates** with **visual state management** for batch operations. Users can queue multiple operations (create, update, delete) and commit them all at once, with automatic rollback on failure.

### Key Features

- **Optimistic Updates**: UI updates immediately, before server confirmation
- **Visual State Indicators**: Clear visual feedback for pending operations
- **Batch Execution**: Execute multiple operations as a single transaction
- **Automatic Conflict Resolution**: Smart handling of conflicting operations
- **Rollback Support**: Automatic rollback on operation failures

## Configuration

### Transaction Modes

| Mode              | Description                                    | Use Case                        |
| ----------------- | ---------------------------------------------- | ------------------------------- |
| `all`             | All operations batched until manual commit    | Batch editing workflows         |
| `bulk-only`       | Only bulk actions batched, row actions immediate | Mixed: bulk edits + quick updates |

**Examples:**
- `all`: Select 5 items → bulk delete → edit 2 items → click "Commit All Changes"  
- `bulk-only`: Select 5 items → bulk delete (batched), click "Toggle Status" → immediate

**Note:** Transactions are disabled by default. For simple CRUD operations, just omit the transaction config:
```tsx
const dataView = useDataView(config); // No batching, immediate operations
```

### Options

```typescript
const dataView = useDataView(config, {
  transaction: {
    enabled: true,
    mode: "all",
    requireConfirmation: true
  }
});
```

#### Transaction Options

- **`mode`**: Batching behavior (`"all"` or `"bulk-only"`)
- **`requireConfirmation`**: Requires explicit confirmation before committing

#### Building Transaction UI

Use the transaction manager to build custom UI components:

```tsx
function TransactionUI({ dataView }) {
  const { transaction } = dataView;
  
  // Get pending operations count for indicators
  const summary = transaction?.getSummary();
  const pendingCount = summary?.total || 0;
  
  // Get operations list for review UI
  const operations = transaction?.getOperations() || [];
  
  return (
    <div>
      {pendingCount > 0 && (
        <Badge>{pendingCount} pending changes</Badge>
      )}
      
      <Button onClick={() => transaction?.commit(true)}>
        Commit Changes
      </Button>
      
      {/* Review UI */}
      <ul>
        {operations.map(op => (
          <li key={op.id}>{op.type} {op.label}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Usage Examples

### Bulk Actions with Transactions

```tsx
import { createBulkDeleteAction, createBulkUpdateAction } from "@smbc/react-dataview";

const bulkActions = [
  createBulkDeleteAction(deleteAPI),
  createBulkUpdateAction(updateAPI, { status: "archived" }, {
    key: "archive-selected",
    label: "Archive Selected"
  })
];
```

### Row Actions with Transactions

```tsx
import { createRowUpdateAction, createToggleStatusAction } from "@smbc/react-dataview";

const rowActions = [
  createToggleStatusAction(updateAPI, "status", ["active", "inactive"], {
    key: "toggle-status", 
    label: "Toggle Status"
  }),
  createRowUpdateAction(updateAPI, (item) => ({ priority: "high" }), {
    key: "mark-priority",
    label: "Mark Priority",
    color: "warning"
  })
];
```

### Transaction Lifecycle Management

```tsx
function TransactionControls({ dataView }) {
  const { transaction } = dataView;

  const handleCommit = async () => {
    try {
      const results = await transaction.commit(true);
      console.log("Transaction committed:", results);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleCancel = () => {
    transaction.cancel();
  };

  const summary = transaction?.getSummary();

  return (
    <div>
      {summary && (
        <div>
          Pending: {summary.total} operations ({summary.byType.create} create,{" "}
          {summary.byType.update} update, {summary.byType.delete} delete)
        </div>
      )}
      <button onClick={handleCommit} disabled={!transaction?.canCommit()}>
        Commit Changes
      </button>
      <button onClick={handleCancel} disabled={!transaction?.hasOperations()}>
        Cancel
      </button>
    </div>
  );
}
```

## Troubleshooting

### Stale Edit Form Data

**Problem**: Edit form shows old values instead of pending changes
**Solution**: Use `getMergedItem` helper to include pending changes

```tsx
const handleEdit = (item) => {
  // ❌ Shows original values
  setEditingItem(item);

  // ✅ Shows current pending values
  const mergedItem = getMergedItem(item);
  setEditingItem(mergedItem);
};
```
