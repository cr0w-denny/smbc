# EWI Events Workflow Permissions Plan

## Overview

Implement a row-level permission system for EWI events workflow actions using the existing dataview package's built-in permission and action system.

## ⚡ Expedient Implementation (Current Priority)

For immediate delivery, we'll implement the **simplest possible solution**:
- Filter workflow menu items based on user permissions for selected events
- Hide menu items that apply to zero selected events
- Don't show the workflow menu at all if no valid actions remain
- Use simple boolean logic: `hasPermission(action, selectedEvents)`

This avoids the complexity of partial bulk operations, sophisticated feedback, and transaction management while delivering the core functionality. A more robust, future-proof solution using the full dataview action system should be implemented later when we have more time to properly architect the interaction patterns.

## Dataview Package Capabilities

The dataview package already provides:
- **DataViewPermissions**: `view`, `create`, `edit`, `delete` permission strings
- **BulkAction<T>**: Actions with `appliesTo(item: T)`, `requiresAllRows`, `disabled()`, `hidden()` functions
- **RowAction<T>**: Per-row actions with similar permission controls
- **Action helpers**: `createBulkUpdateAction`, `createBulkDeleteAction`, etc.
- **Smart selection**: Actions can be filtered based on what applies to selected items
- **Transaction system**: Optimistic updates with rollback on failure

## Current State

- Global roles: Guest, Analyst, Staff, Manager, Admin
- Global permissions: VIEW_EVENTS, EDIT_OWN_EVENTS, EDIT_ALL_EVENTS
- ag-grid with row checkboxes for bulk selection
- Workflow menu opens when 2+ rows selected

## Requirements

### Row-Level Permission Fields
- `is_owner`: User owns/created this specific event
- `is_manager`: User has management rights over this specific event

### Permission Logic
- **is_manager**: Can perform all workflow actions on the event
- **is_owner**: Has limited/no workflow permissions (needs clarification)
- Neither: No workflow permissions on this event

## UX Design Proposals

### Option A: Progressive Disclosure
1. Always show workflow menu when 2+ items selected
2. Filter menu options based on what user can actually do with selected items
3. Show disabled options with tooltips explaining why they're unavailable
4. Group actions by permission level (e.g., "Manager Actions", "Owner Actions")

### Option B: Smart Pre-filtering
1. Only enable bulk selection checkboxes on rows where user has workflow permissions
2. Workflow menu only appears if at least 2 actionable items are selected
3. Cleaner UX but less transparent about what exists

### Option C: Mixed Selection Handling
1. Allow selection of any items
2. Workflow menu shows all possible actions
3. When action is clicked, filter execution to only items user has permission for
4. Show summary: "Action applied to X of Y selected items (Z items skipped due to permissions)"

## Recommended Approach: Option A + C Hybrid

### UX Flow
1. **Selection**: Allow selection of any rows
2. **Menu Display**: Show workflow menu with all logically possible actions
3. **Action Indication**: Use visual cues (icons, colors, badges) to indicate:
   - ✅ Actions available for all selected items
   - ⚠️ Actions available for some selected items
   - ❌ Actions not available for any selected items
4. **Execution**: When action is chosen, apply to eligible items only with clear feedback

### Visual Design
```
Workflow Menu
├── 📝 Edit Events ✅ (Available for 3/3 items)
├── 🗑️ Delete Events ⚠️ (Available for 2/3 items)
├── 📤 Export Events ✅ (Available for 3/3 items)
└── 🔒 Archive Events ❌ (Requires manager permissions)
```

## Implementation Plan (Using Dataview System)

### 1. Define Permission Logic Functions

```typescript
// Event-specific permission checker
function canEditEvent(event: EventRecord, userRoles: string[], globalPermissions: string[]): boolean {
  return globalPermissions.includes('EDIT_ALL_EVENTS') ||
         (globalPermissions.includes('EDIT_OWN_EVENTS') && event.is_owner) ||
         event.is_manager;
}

function canDeleteEvent(event: EventRecord, userRoles: string[], globalPermissions: string[]): boolean {
  return globalPermissions.includes('EDIT_ALL_EVENTS') || event.is_manager;
}

function canArchiveEvent(event: EventRecord, userRoles: string[], globalPermissions: string[]): boolean {
  return globalPermissions.includes('EDIT_ALL_EVENTS') || event.is_manager;
}
```

### 2. Create Actions Using Dataview Helpers

```typescript
import { createBulkUpdateAction, createBulkDeleteAction } from '@smbc/dataview';

// Archive selected events
const archiveAction = createBulkUpdateAction(
  archiveEventAPI,
  { status: 'archived' },
  {
    key: 'archive-selected',
    label: 'Archive Selected',
    color: 'warning',
    icon: ArchiveIcon,
  }
);

// Add permission logic to action
archiveAction.appliesTo = (event: EventRecord) =>
  canArchiveEvent(event, userRoles, userPermissions);

// Delete selected events
const deleteAction = createBulkDeleteAction(deleteEventAPI, {
  key: 'delete-selected',
  label: 'Delete Selected',
  icon: DeleteIcon,
});

deleteAction.appliesTo = (event: EventRecord) =>
  canDeleteEvent(event, userRoles, userPermissions);
```

### 3. Configure DataView with Actions

```typescript
const eventDataViewConfig: DataViewConfig<EventRecord> = {
  // ... existing config
  actions: {
    bulk: [
      {
        type: 'bulk',
        key: 'edit-selected',
        label: 'Edit Selected',
        icon: EditIcon,
        appliesTo: (event) => canEditEvent(event, userRoles, userPermissions),
        onClick: (items) => openBulkEditDialog(items),
      },
      archiveAction,
      deleteAction,
      {
        type: 'bulk',
        key: 'export-selected',
        label: 'Export Selected',
        icon: ExportIcon,
        appliesTo: () => true, // Export always available
        onClick: (items) => exportEvents(items),
      }
    ],
    row: [
      {
        type: 'row',
        key: 'edit',
        label: 'Edit',
        icon: EditIcon,
        disabled: (event) => !canEditEvent(event, userRoles, userPermissions),
        onClick: (event) => openEditDialog(event),
      },
      {
        type: 'row',
        key: 'delete',
        label: 'Delete',
        icon: DeleteIcon,
        color: 'error',
        disabled: (event) => !canDeleteEvent(event, userRoles, userPermissions),
        onClick: (event) => deleteEvent(event),
      }
    ]
  },
  permissions: {
    view: 'VIEW_EVENTS',
    create: 'EDIT_OWN_EVENTS',
    edit: 'EDIT_OWN_EVENTS', // Further filtered by appliesTo/disabled
    delete: 'EDIT_ALL_EVENTS', // Further filtered by appliesTo/disabled
  }
};
```

### 4. Automatic UI Handling

The dataview system will automatically:
- Show/hide bulk actions based on `appliesTo()` results for selected items
- Disable row actions based on `disabled()` results
- Handle partial bulk operations (some items succeed, some fail)
- Provide transaction support with optimistic updates
- Show appropriate feedback messages

## Integration with Current Role System

### Global Role Permissions (unchanged)
- **VIEW_EVENTS**: Can see events list
- **EDIT_OWN_EVENTS**: Can edit events they own
- **EDIT_ALL_EVENTS**: Can edit any event

### Row-Level Enhancements
- Global permissions act as baseline capabilities
- Row-level `is_owner`/`is_manager` fields provide additional context
- Final permission = `global_permission AND row_level_permission`

### Permission Resolution Logic
```typescript
function canPerformAction(action: string, event: EventRecord, globalPerms: Permission[]): boolean {
  switch (action) {
    case 'edit':
      return globalPerms.includes('EDIT_ALL_EVENTS') ||
             (globalPerms.includes('EDIT_OWN_EVENTS') && event.is_owner) ||
             event.is_manager;

    case 'delete':
      return globalPerms.includes('EDIT_ALL_EVENTS') || event.is_manager;

    case 'archive':
      return globalPerms.includes('EDIT_ALL_EVENTS') || event.is_manager;

    default:
      return false;
  }
}
```

## Questions for Discussion

1. **Owner Permissions**: What exactly should `is_owner` users be able to do? Currently assuming limited workflow access.

2. **Manager vs Global Admin**: Should `is_manager` override global role restrictions, or should global roles take precedence?

3. **Visual Feedback**: Do you prefer the badge approach showing "2/3 items" or a different visual indicator?

4. **Action Scope**: What specific workflow actions need to be implemented? (edit, delete, archive, export, assign, etc.)

5. **Error Handling**: Should we prevent actions entirely if user lacks permissions, or allow them to try and show informative errors?

6. **Performance**: With large datasets, should we pre-calculate permissions server-side or compute client-side as needed?

## Next Steps

1. Clarify owner permission scope and workflow actions list
2. Implement row-level permission calculator
3. Update ag-grid to use new permission system
4. Build workflow menu with permission indicators
5. Add comprehensive error handling and user feedback
6. Test with various permission combinations