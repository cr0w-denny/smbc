import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle,
  ErrorOutline,
  Speed,
  Code,
  AutoFixHigh,
  ExpandMore,
  Security,
} from "@mui/icons-material";

export const DataViewRoute: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="DataView Overview" />
          <Tab label="Transaction UI Pattern" />
          <Tab label="Optimistic Updates" />
          <Tab label="Implementation Examples" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              DataView Component
            </Typography>

            <Typography variant="body1" sx={{ my: 2 }}>
              DataView is SMBC's comprehensive solution for data-driven UIs. It
              combines{" "}
              <strong>
                filtering, pagination, sorting, bulk actions, and immediate UI
                feedback
              </strong>{" "}
              into a declarative, type-safe component that handles complex data
              management scenarios using either optimistic updates or
              transaction overlays.
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
                  <strong>Optimistic Updates:</strong> Immediate UI feedback
                  with automatic rollback on errors
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
                  <strong>Action Trigger:</strong> User selects items and
                  chooses an action (e.g., "Deactivate Selected")
                </li>
                <li>
                  <strong>Staging:</strong> Changes are added to a pending
                  transactions list
                </li>
                <li>
                  <strong>Review:</strong> User can view all pending changes in
                  a centralized transactions panel
                </li>
                <li>
                  <strong>Commit:</strong> User executes all transactions
                  simultaneously
                </li>
                <li>
                  <strong>Visual Feedback:</strong> UI shows pending changes
                  immediately via overlay while API calls process in background
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
              {`// Transaction configuration in DataView
options={{
  transaction: {
    enabled: true,
    requireConfirmation: true,
    allowPartialSuccess: true,
    emitActivities: true
  }
}}

// Bulk actions are configured separately
bulkActions: [
  {
    key: "deactivate",
    label: "Deactivate Selected",
    confirmationTitle: "Deactivate Users?",
    action: async (users) => {
      // This creates transaction operations
      // that are staged for review
      return api.deactivateUsers(users.map(u => u.id));
    }
  }
]`}
            </Typography>

            <Typography variant="h6" sx={{ m: 3 }}>
              Optimistic Updates vs Transaction Overlay
            </Typography>
            <Typography variant="body1" sx={{ m: 2 }}>
              SMBC offers two approaches for immediate UI feedback. Choose based
              on the complexity of your operations and user workflow
              requirements:
            </Typography>

            <Typography component="div" variant="body1">
              <strong>Optimistic Updates - Choose When:</strong>
              <ul>
                <li>
                  <strong>Simple property changes:</strong> Updating status,
                  flags, or simple fields
                </li>
                <li>
                  <strong>Independent operations:</strong> Each item can
                  succeed/fail independently
                </li>
                <li>
                  <strong>Immediate feedback priority:</strong> Users expect
                  instant visual response
                </li>
                <li>
                  <strong>Works with pagination:</strong> For in-place updates
                  that don't change item positioning
                </li>
              </ul>
            </Typography>

            <Typography component="div" variant="body1" sx={{ mt: 2 }}>
              <strong>Transaction Overlay - Choose When:</strong>
              <ul>
                <li>
                  <strong>Complex operations:</strong> Multi-step workflows or
                  interdependent changes
                </li>
                <li>
                  <strong>Batch coordination:</strong> Operations that should
                  succeed/fail as a group
                </li>
                <li>
                  <strong>Cross-page changes:</strong> Operations affecting
                  items on different pages
                </li>
                <li>
                  <strong>Review before commit:</strong> Users need to review
                  all changes before execution
                </li>
                <li>
                  <strong>Audit trail:</strong> Need detailed tracking of what
                  was attempted vs. completed
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
              {`// OPTIMISTIC UPDATES - Simple property changes
const optimisticConfig = {
  // No pagination restriction - works fine for in-place updates
  pagination: { enabled: true, defaultPageSize: 20 },
  actions: {
    bulk: [{
      key: "toggle-status",
      label: "Toggle Status",
      onClick: async (items) => {
        // 1. Update cache immediately
        queryClient.setQueryData(queryKey, (oldData) => ({
          ...oldData,
          products: oldData.products.map(product => 
            items.find(item => item.id === product.id)
              ? { ...product, active: !product.active }
              : product
          )
        }));
        
        // 2. Make API calls, rollback failures individually
        const failed = [];
        for (const item of items) {
          try {
            await api.updateProduct(item.id, { active: !item.active });
          } catch {
            failed.push(item);
          }
        }
        
        // 3. Revert only failed items
        if (failed.length > 0) {
          queryClient.setQueryData(queryKey, (oldData) => ({
            ...oldData,
            products: oldData.products.map(product => {
              const failedItem = failed.find(f => f.id === product.id);
              return failedItem 
                ? { ...product, active: failedItem.active } // revert
                : product;
            })
          }));
        }
      }
    }]
  }
};

// TRANSACTION OVERLAY - Complex coordinated operations  
const transactionConfig = {
  pagination: { enabled: true },
  options: {
    transaction: { 
      enabled: true,
      requireConfirmation: true,
      allowPartialSuccess: false // All or nothing
    }
  },
  actions: {
    bulk: [{
      key: "reassign-department",
      label: "Reassign to Department",
      onClick: async (items) => {
        // This creates staged transactions for review
        return transactionManager.stageOperations(
          items.map(item => ({
            type: 'update',
            entityId: item.id,
            data: { departmentId: newDepartmentId },
            dependencies: ['validate-capacity', 'update-permissions']
          }))
        );
      }
    }]
  }
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
              <strong>Implementation Considerations:</strong> Both approaches
              work with pagination. Optimistic updates are simpler for in-place
              property changes (like toggling status), while transaction overlay
              provides better control for complex operations that might move
              items between pages or require coordinated execution.
            </Typography>

            <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
              🚀 Try the User Management applet to see DataView in action with
              real data, filtering, bulk operations, and transaction overlay
              patterns.
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
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
                  <strong>Action Trigger:</strong> User selects items and
                  chooses an action (e.g., "Deactivate Selected")
                </li>
                <li>
                  <strong>Staging:</strong> Changes are added to a pending
                  transactions list
                </li>
                <li>
                  <strong>Review:</strong> User can view all pending changes in
                  a centralized transactions panel
                </li>
                <li>
                  <strong>Commit:</strong> User executes all transactions
                  simultaneously
                </li>
                <li>
                  <strong>Visual Feedback:</strong> UI shows pending changes
                  immediately via overlay while API calls process in background
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
              {`// Transaction configuration in DataView
options={{
  transaction: {
    enabled: true,
    requireConfirmation: true,
    allowPartialSuccess: true,
    emitActivities: true
  }
}}

// Bulk actions are configured separately
bulkActions: [
  {
    key: "deactivate",
    label: "Deactivate Selected",
    confirmationTitle: "Deactivate Users?",
    action: async (users) => {
      // This creates transaction operations
      // that are staged for review
      return api.deactivateUsers(users.map(u => u.id));
    }
  }
]`}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Transaction Overlay - Choose When:
            </Typography>
            <Typography component="div" variant="body1">
              <ul>
                <li>
                  <strong>Complex operations:</strong> Multi-step workflows or
                  interdependent changes
                </li>
                <li>
                  <strong>Batch coordination:</strong> Operations that should
                  succeed/fail as a group
                </li>
                <li>
                  <strong>Cross-page changes:</strong> Operations affecting
                  items on different pages
                </li>
                <li>
                  <strong>Review before commit:</strong> Users need to review
                  all changes before execution
                </li>
                <li>
                  <strong>Audit trail:</strong> Need detailed tracking of what
                  was attempted vs. completed
                </li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Box>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  Optimistic updates provide instant user feedback by updating
                  the react-query cache immediately, handling API responses
                  asynchronously with automatic error rollback.
                </Typography>
              </Alert>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 2,
                }}
              >
                <Alert severity="success" icon={<Speed />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Instant UI Feedback
                  </Typography>
                  <Typography variant="body2">
                    Changes appear immediately in the UI, providing excellent
                    user experience with no loading delays.
                  </Typography>
                </Alert>

                <Alert severity="info" icon={<Security />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Individual Error Handling
                  </Typography>
                  <Typography variant="body2">
                    Each item can succeed or fail independently. Failed items
                    rollback automatically without affecting successful ones.
                  </Typography>
                </Alert>

                <Alert severity="warning" icon={<Code />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    99% Less Boilerplate
                  </Typography>
                  <Typography variant="body2">
                    Framework handles cache keys, rollback logic, and error
                    states. Developers just declare what they want.
                  </Typography>
                </Alert>

                <Alert severity="error" icon={<AutoFixHigh />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Framework Managed
                  </Typography>
                  <Typography variant="body2">
                    Automatic detection of optimistic mode, query key
                    resolution, and cache structure preservation.
                  </Typography>
                </Alert>
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="success.main"
                    gutterBottom
                    sx={{ ml: 3 }}
                  >
                    ✅ Perfect For:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Simple property changes"
                        secondary="Toggle status, update flags, change categories"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Independent operations"
                        secondary="Each item can succeed/fail on its own"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Immediate feedback priority"
                        secondary="Users expect instant visual response"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="In-place updates"
                        secondary="Changes don't affect item positioning"
                      />
                    </ListItem>
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    ⚠️ Consider Transaction Mode For:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorOutline color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Complex workflows"
                        secondary="Multi-step operations with dependencies"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorOutline color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="All-or-nothing operations"
                        secondary="Batch must succeed/fail as a group"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorOutline color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Review before commit"
                        secondary="Users need to see all changes before execution"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorOutline color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cross-page operations"
                        secondary="Changes affect items on different pages"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 3 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Implementation Examples
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  Code Example: Optimistic Bulk Action
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Here's how simple it is to create optimistic bulk actions with
                  the framework:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.300",
                    p: 2,
                    borderRadius: 1,
                    fontSize: "0.9rem",
                    overflow: "auto",
                    fontFamily: 'Monaco, "Lucida Console", monospace',
                  }}
                >
                  {`// Create an optimistic bulk update action
createOptimisticBulkUpdateAction(
  // 1. API call function - what to call for each item
  async (item: Product, updateData: Partial<Product>) => {
    const response = await apiClient.PATCH("/products/{id}", {
      params: { path: { id: item.id } },
      body: updateData,
    });
    if (response.error) throw new Error(response.error.message);
    return response.data;
  },
  
  // 2. Optimistic update function - how to update each item
  (item: Product) => ({ inStock: true }),
  
  // 3. Action configuration - how it appears in the UI
  {
    key: "mark-in-stock",
    label: "Mark In Stock",
    icon: CheckCircle,
    color: "success",
  }
)

// That's it! Framework automatically handles:
// ✅ Finding the correct React Query cache key
// ✅ Applying optimistic updates immediately  
// ✅ Making API calls in parallel for each item
// ✅ Rolling back only failed items individually
// ✅ Preserving successful updates`}
                </Box>

                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>🎉 99% less code!</strong> No more manual cache
                    management, query key hunting, or rollback logic. Just
                    declare your intent and the framework handles the rest.
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Typography
              component="pre"
              variant="body2"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                p: 2,
                mt: 3,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.85rem",
                overflow: "auto",
              }}
            >
              {`// OPTIMISTIC UPDATES - Simple property changes
const optimisticConfig = {
  // No pagination restriction - works fine for in-place updates
  pagination: { enabled: true, defaultPageSize: 20 },
  actions: {
    bulk: [{
      key: "toggle-status",
      label: "Toggle Status",
      onClick: async (items) => {
        // 1. Update cache immediately
        queryClient.setQueryData(queryKey, (oldData) => ({
          ...oldData,
          products: oldData.products.map(product => 
            items.find(item => item.id === product.id)
              ? { ...product, active: !product.active }
              : product
          )
        }));
        
        // 2. Make API calls, rollback failures individually
        const failed = [];
        for (const item of items) {
          try {
            await api.updateProduct(item.id, { active: !item.active });
          } catch {
            failed.push(item);
          }
        }
        
        // 3. Revert only failed items
        if (failed.length > 0) {
          queryClient.setQueryData(queryKey, (oldData) => ({
            ...oldData,
            products: oldData.products.map(product => {
              const failedItem = failed.find(f => f.id === product.id);
              return failedItem 
                ? { ...product, active: failedItem.active } // revert
                : product;
            })
          }));
        }
      }
    }]
  }
};

// TRANSACTION OVERLAY - Complex coordinated operations  
const transactionConfig = {
  pagination: { enabled: true },
  options: {
    transaction: { 
      enabled: true,
      requireConfirmation: true,
      allowPartialSuccess: false // All or nothing
    }
  },
  actions: {
    bulk: [{
      key: "reassign-department",
      label: "Reassign to Department",
      onClick: async (items) => {
        // This creates staged transactions for review
        return transactionManager.stageOperations(
          items.map(item => ({
            type: 'update',
            entityId: item.id,
            data: { departmentId: newDepartmentId },
            dependencies: ['validate-capacity', 'update-permissions']
          }))
        );
      }
    }]
  }
};`}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>Implementation Considerations:</strong> Both approaches
              work with pagination. Optimistic updates are simpler for in-place
              property changes (like toggling status), while transaction overlay
              provides better control for complex operations that might move
              items between pages or require coordinated execution.
            </Typography>

            <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
              🚀 Try the Product Catalog applet to see optimistic updates in
              action with real data, including automatic error rollback
              demonstrations.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
