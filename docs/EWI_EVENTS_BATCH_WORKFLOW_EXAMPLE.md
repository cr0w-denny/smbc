# EWI Events Batch Workflow Example

## Scenario: Add LOD Analyst to 100 Selected Events

This document shows how the batch system would work from the EWI Events applet perspective when a user selects 100 records and chooses "Add 1 LOD Analyst" from the workflow menu.

## User Flow

1. **User selects 100 events** in ag-grid table
2. **Workflow menu appears** with available bulk actions
3. **User clicks "Add 1 LOD Analyst"**
4. **System executes batch operation** with real-time progress
5. **Activity center shows progress** with cancel/undo options
6. **User gets completion notification** with summary of results

## Implementation Architecture

### **1. Action Definition (EWI Events Applet)**

```typescript
// In EWI Events applet: src/actions/workflowActions.ts
import { BatchBuilder } from '@smbc/ui-transactions';
import { hasPermission } from '@smbc/ui-permissions';
import { ActivityTracker } from '@smbc/ui-activity';

const addLODAnalystAction = {
  type: 'bulk',
  key: 'add-lod-analyst',
  label: 'Add 1 LOD Analyst',
  icon: PersonAddIcon,
  color: 'primary',

  // Permission check - can user perform this action?
  appliesTo: (event: EventRecord) =>
    hasPermission('EDIT_EVENT_TEAM', event, userPermissions) &&
    event.lod_analysts.length < event.max_lod_analysts,

  // Execute the batch workflow
  onClick: async (selectedEvents: EventRecord[]) => {
    // Filter to only eligible events
    const eligibleEvents = selectedEvents.filter(event =>
      event.lod_analysts.length < event.max_lod_analysts
    );

    if (eligibleEvents.length === 0) {
      showError('No selected events are eligible for LOD analyst assignment');
      return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog({
      title: 'Add LOD Analyst',
      message: `Add 1 LOD analyst to ${eligibleEvents.length} events?`,
      details: selectedEvents.length > eligibleEvents.length
        ? `${selectedEvents.length - eligibleEvents.length} events will be skipped (already at max capacity)`
        : undefined
    });

    if (!confirmed) return;

    // Create and execute batch operation
    const batch = new BatchBuilder<EventRecord>()
      .update(eligibleEvents, {
        lod_analysts: (event) => [...event.lod_analysts, {
          id: generateId(),
          assigned_at: new Date(),
          assigned_by: currentUser.id,
          status: 'assigned'
        }]
      }, {
        updateAPI: updateEventTeam,
        rollback: (event, originalEvent) => updateEventTeam(event.id, {
          lod_analysts: originalEvent.lod_analysts
        })
      });

    // Execute with activity tracking
    const context = await batch.execute({
      concurrency: 5, // Don't overwhelm the API
      stopOnFirstError: false, // Continue even if some fail
      progressCallback: (progress) => {
        // Real-time progress updates
        ActivityTracker.updateProgress(context.id, {
          message: `Adding LOD analysts: ${progress.completedItems}/${progress.totalItems} events processed`,
          percentage: (progress.completedItems / progress.totalItems) * 100
        });
      }
    });

    // Show completion summary
    showBatchCompletionSummary(context, {
      successMessage: (count) => `Successfully added LOD analyst to ${count} events`,
      failureMessage: (count) => `Failed to update ${count} events`,
      undoAvailable: true
    });
  }
};
```

### **2. ag-grid Integration**

```typescript
// In EWI Events table component
import { useSelection } from '@smbc/ui-selection';
import { WorkflowMenu } from '@smbc/mui-actions';

const EWIEventsTable: React.FC = () => {
  const { data, isLoading } = useEWIEventsQuery();
  const selection = useSelection(data, event => event.id);

  // Workflow actions for this table
  const workflowActions = [
    addLODAnalystAction,
    removeLODAnalystAction,
    changeStatusAction,
    assignOwnerAction,
    exportEventsAction
  ];

  // Filter actions based on selection and permissions
  const availableActions = workflowActions.filter(action => {
    if (selection.selectedItems.length === 0) return false;
    return selection.selectedItems.some(item => action.appliesTo?.(item));
  });

  return (
    <Box>
      {/* Workflow menu appears when items are selected */}
      {selection.selectedItems.length > 0 && (
        <WorkflowMenu
          selectedItems={selection.selectedItems}
          actions={availableActions}
          onClose={() => selection.clearSelection()}
        />
      )}

      {/* ag-grid table */}
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        rowSelection="multiple"
        onSelectionChanged={(event) => {
          const selectedRows = event.api.getSelectedRows();
          selection.setSelection(selectedRows.map(row => row.id));
        }}
        // ... other ag-grid props
      />
    </Box>
  );
};
```

### **3. Activity Center Integration**

```typescript
// Activity center automatically tracks the batch operation
const batchActivity: BatchActivity = {
  id: 'batch-add-lod-analyst-2024-09-28-1',
  type: 'batch-operation',
  title: 'Add LOD Analyst to Events',
  description: 'Adding 1 LOD analyst to 100 selected events',
  status: 'running', // -> 'completed' | 'failed' | 'cancelled'

  // Progress tracking
  progress: {
    totalOperations: 1,
    completedOperations: 0,
    totalItems: 100,
    completedItems: 67,
    failedItems: 2,
    currentOperation: 'Updating event team assignments'
  },

  // Interactive capabilities
  actions: [
    {
      type: 'cancel',
      label: 'Cancel Operation',
      available: status === 'running',
      onClick: () => batchExecutor.cancel(batchId)
    },
    {
      type: 'undo',
      label: 'Undo Changes',
      available: status === 'completed',
      onClick: () => batchExecutor.undo(batchId)
    },
    {
      type: 'retry',
      label: 'Retry Failed Items',
      available: status === 'failed' && failedItems.length > 0,
      onClick: () => batchExecutor.retryFailed(batchId)
    }
  ],

  // Detailed results
  results: {
    successful: 98,
    failed: 2,
    failureReasons: [
      { eventId: 'evt-123', reason: 'Event already at maximum LOD analyst capacity' },
      { eventId: 'evt-456', reason: 'Network timeout - please retry' }
    ]
  },

  startedAt: new Date('2024-09-28T10:30:00Z'),
  completedAt: new Date('2024-09-28T10:32:15Z') // 2 minutes 15 seconds
};
```

### **4. Real-time UI Updates**

```typescript
// As the batch executes, the UI updates in real-time
const BatchProgressIndicator: React.FC<{ batchId: string }> = ({ batchId }) => {
  const { progress, status } = useBatchProgress(batchId);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GroupAddIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Adding LOD Analyst to Events</Typography>
          {status === 'running' && (
            <Chip
              label="In Progress"
              color="primary"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {progress.currentOperation}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={(progress.completedItems / progress.totalItems) * 100}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">
            {progress.completedItems} of {progress.totalItems} events processed
          </Typography>
          <Typography variant="caption">
            {progress.failedItems > 0 && `${progress.failedItems} failed`}
          </Typography>
        </Box>

        {status === 'running' && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              onClick={() => cancelBatch(batchId)}
              startIcon={<CancelIcon />}
            >
              Cancel Operation
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

### **5. Completion Notification**

```typescript
// After batch completes, user gets actionable notification
const BatchCompletionNotification: React.FC = () => {
  return (
    <Snackbar open={true} autoHideDuration={10000}>
      <Alert
        severity="success"
        action={
          <Box>
            <Button color="inherit" size="small" onClick={undoBatch}>
              Undo
            </Button>
            <Button color="inherit" size="small" onClick={viewDetails}>
              Details
            </Button>
          </Box>
        }
      >
        <AlertTitle>LOD Analyst Added Successfully</AlertTitle>
        Added LOD analyst to 98 of 100 events. 2 events failed to update.
      </Alert>
    </Snackbar>
  );
};
```

## Error Handling Examples

### **Partial Failures**
```typescript
// Some events succeed, some fail
{
  successful: 87,
  failed: 13,
  failureReasons: [
    { count: 8, reason: 'Already at maximum LOD analyst capacity' },
    { count: 3, reason: 'Insufficient permissions for event' },
    { count: 2, reason: 'Network timeout - can retry' }
  ],
  retryableFailures: 2, // Network timeouts can be retried
  actions: ['undo', 'retry-failed', 'export-failures']
}
```

### **Permission Errors**
```typescript
// User lacks permission for some events
{
  successful: 65,
  failed: 35,
  failureReasons: [
    {
      count: 35,
      reason: 'Insufficient permissions - you can only modify events you own',
      suggestion: 'Contact your manager to request broader edit permissions'
    }
  ],
  actions: ['undo'] // No retry since it's a permission issue
}
```

### **API Errors**
```typescript
// Upstream service is down
{
  successful: 0,
  failed: 100,
  failureReasons: [
    {
      count: 100,
      reason: 'Team assignment service is temporarily unavailable',
      suggestion: 'Please try again in a few minutes'
    }
  ],
  actions: ['retry-all'] // All can be retried
}
```

## Integration Points

### **With ag-grid Selection**
- ag-grid selection drives workflow menu visibility
- Selected row count updates workflow action labels
- Selection cleared after successful batch completion

### **With Permission System**
- Actions filtered by user permissions
- Row-level permission checks during execution
- Clear error messages for permission failures

### **With Activity Center**
- All batch operations automatically tracked
- Rich progress visualization with real-time updates
- Interactive undo/cancel/retry from activity feed

### **With API Layer**
- Respects rate limiting with concurrency control
- Automatic retry for transient failures
- Optimistic updates with rollback on failure

This example shows how the batch system provides a sophisticated, user-friendly experience for complex bulk operations while maintaining data integrity and providing clear feedback throughout the process.