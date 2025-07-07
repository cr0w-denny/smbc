import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export const DataViewRoute: React.FC = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            DataView Component
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            DataView is SMBC's comprehensive solution for data-driven UIs. It
            combines{" "}
            <strong>
              filtering, pagination, sorting, bulk actions, and immediate UI
              feedback
            </strong>{" "}
            into a declarative, type-safe component that handles complex data
            management scenarios using either optimistic updates or transaction
            overlays.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Core Architecture
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>Declarative Configuration:</strong> Define your entire
                data interface through configuration objects
              </li>
              <li>
                <strong>React Query Integration:</strong> Built-in caching,
                background updates, and error handling
              </li>
              <li>
                <strong>Type Safety:</strong> Full TypeScript support for
                entities, filters, and actions
              </li>
              <li>
                <strong>Hash Navigation:</strong> URL-synced filters and
                pagination state
              </li>
              <li>
                <strong>Optimistic Updates:</strong> Immediate UI feedback with
                automatic rollback on errors
              </li>
            </ul>
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              mt: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Basic DataView setup
<MuiDataView
  config={{
    entityName: "users",
    apiEndpoint: "/api/users",
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "status", label: "Status" }
    ],
    filters: {
      fields: [
        { name: "search", type: "search", label: "Search" },
        { name: "status", type: "select", options: [...] }
      ]
    },
    actions: {
      bulk: [
        { key: "activate", label: "Activate Selected" },
        { key: "deactivate", label: "Deactivate Selected" }
      ],
      row: [
        { key: "edit", label: "Edit" },
        { key: "delete", label: "Delete" }
      ]
    }
  }}
/>`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Transaction UI Pattern
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            DataView uses a <strong>"transaction-based UI"</strong> pattern
            where user actions are staged as pending changes before being
            committed. This provides users with a clear overview of what will
            happen and the ability to review/modify before execution.
          </Typography>

          <Typography component="div" variant="body1">
            <strong>Transaction Flow:</strong>
            <ol>
              <li>
                <strong>Action Trigger:</strong> User selects items and chooses
                an action (e.g., "Deactivate Selected")
              </li>
              <li>
                <strong>Staging:</strong> Changes are added to a pending
                transactions list
              </li>
              <li>
                <strong>Review:</strong> User can view all pending changes in a
                centralized transactions panel
              </li>
              <li>
                <strong>Commit:</strong> User executes all transactions
                simultaneously
              </li>
              <li>
                <strong>Optimistic Update:</strong> UI updates immediately while
                API calls process in background
              </li>
            </ol>
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              mt: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Transaction configuration
transactions: {
  enabled: true,
  actions: [
    {
      key: "bulk_update_status",
      label: "Update Status",
      optimisticUpdate: (entities, actionData) => ({
        ...entities,
        status: actionData.newStatus
      }),
      apiCall: (entityIds, actionData) => 
        api.updateUserStatus(entityIds, actionData.newStatus)
    }
  ]
}`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Optimistic Updates vs Transaction Overlay
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            SMBC uses two different approaches for immediate UI feedback
            depending on the complexity of the data view:
          </Typography>

          <Typography component="div" variant="body1">
            <strong>Unpaginated Views:</strong>
            <ul>
              <li>
                <strong>True Optimistic Updates:</strong> Query cache is
                immediately updated
              </li>
              <li>
                <strong>Automatic Rollback:</strong> Reverts on API failure
              </li>
              <li>
                <strong>Best for:</strong> Small datasets, single-page views
              </li>
            </ul>
          </Typography>

          <Typography component="div" variant="body1" sx={{ mt: 2 }}>
            <strong>Paginated Views:</strong>
            <ul>
              <li>
                <strong>Transaction Overlay:</strong> Pending changes are
                overlaid on query data
              </li>
              <li>
                <strong>Visual Feedback:</strong> Users see changes immediately
                via UI overlay
              </li>
              <li>
                <strong>Cache Unchanged:</strong> React Query cache remains
                unmodified until commit
              </li>
              <li>
                <strong>Why:</strong> Pagination makes cache updates complex and
                error-prone
              </li>
            </ul>
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              mt: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Transaction overlay approach (used with pagination)
const DataViewWithTransactions = () => {
  const { data: queryData } = useQuery(['users']);
  const { pendingTransactions } = useTransactions();
  
  // Overlay pending changes on query data
  const displayData = useMemo(() => {
    if (!queryData) return [];
    
    return queryData.map(item => {
      const pendingChange = pendingTransactions.find(
        tx => tx.entityId === item.id
      );
      
      if (pendingChange) {
        // Show pending state visually
        return {
          ...item,
          ...pendingChange.data,
          _isPending: true
        };
      }
      
      return item;
    });
  }, [queryData, pendingTransactions]);
  
  return <DataTable data={displayData} />;
};`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Real-World Example: User Management
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The User Management applet demonstrates the transaction overlay
            pattern in a paginated environment:
          </Typography>

          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>Pagination Active:</strong> Large user datasets with
                server-side pagination
              </li>
              <li>
                <strong>Transaction Mode:</strong> Bulk actions use staging
                rather than optimistic updates
              </li>
              <li>
                <strong>Visual Overlay:</strong> Pending changes appear
                immediately via UI styling
              </li>
              <li>
                <strong>Staging Area:</strong> Users can review all pending
                changes before commit
              </li>
              <li>
                <strong>Cache Safety:</strong> Query cache remains untouched
                until server confirms changes
              </li>
              <li>
                <strong>Error Handling:</strong> Failed transactions show
                specific errors without cache corruption
              </li>
            </ul>
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
            <strong>Why Not Optimistic Updates?</strong> With pagination, a user
            might be on page 3 when they deactivate a user. If that user would
            normally be filtered out and move to a different page,
            optimistically updating the cache becomes complex and can lead to
            inconsistent state.
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
            🚀 Try the User Management applet to see DataView in action with
            real data, filtering, bulk operations, and transaction overlay
            patterns.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
