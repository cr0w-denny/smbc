# @smbc/applet-dataview

React hook for building data views with transaction support, optimistic updates, and visual state management.

## Usage

```tsx
import { useDataView } from '@smbc/applet-dataview';

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

The transaction system provides optimistic UI updates with visual state management for batch operations. Users can queue multiple operations and commit them all at once, with automatic rollback on failure.

### Features

- Optimistic updates before server confirmation
- Visual indicators for pending operations
- Batch execution of multiple operations
- Automatic conflict resolution
- Rollback support on failures

## Configuration

### Transaction Modes

| Mode              | Description                                    | Use Case                        |
| ----------------- | ---------------------------------------------- | ------------------------------- |
| `all`             | All operations batched until manual commit    | Batch editing workflows         |
| `bulk-only`       | Only bulk actions batched, row actions immediate | Mixed workflows |

**Note:** Transactions are disabled by default. For simple CRUD operations, omit the transaction config.

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

### Building Transaction UI

```tsx
function TransactionUI({ dataView }) {
  const { transaction } = dataView;
  
  const summary = transaction?.getSummary();
  const pendingCount = summary?.total || 0;
  const operations = transaction?.getOperations() || [];
  
  return (
    <div>
      {pendingCount > 0 && (
        <Badge>{pendingCount} pending changes</Badge>
      )}
      
      <Button onClick={() => transaction?.commit(true)}>
        Commit Changes
      </Button>
      
      <ul>
        {operations.map(op => (
          <li key={op.id}>{op.type} {op.label}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Action Helpers

### Bulk Actions

```tsx
import { createBulkDeleteAction, createBulkUpdateAction } from "@smbc/applet-dataview";

const bulkActions = [
  createBulkDeleteAction(deleteAPI),
  createBulkUpdateAction(updateAPI, { status: "archived" }, {
    key: "archive-selected",
    label: "Archive Selected"
  })
];
```

### Row Actions

```tsx
import { createRowUpdateAction, createToggleStatusAction } from "@smbc/applet-dataview";

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

## Transaction Management

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
  // Shows original values
  setEditingItem(item);

  // Shows current pending values
  const mergedItem = getMergedItem(item);
  setEditingItem(mergedItem);
};
```