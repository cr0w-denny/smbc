import React from "react";
import { Box, Typography, Alert, Paper, Stack, Chip } from "@mui/material";

export const DataViewDemo: React.FC = () => {
  const sampleData = [
    { id: 1, name: "John Doe", role: "Admin", status: "Active", lastLogin: "2024-01-15" },
    { id: 2, name: "Jane Smith", role: "Editor", status: "Active", lastLogin: "2024-01-14" },
    { id: 3, name: "Bob Wilson", role: "Viewer", status: "Inactive", lastLogin: "2024-01-10" },
    { id: 4, name: "Alice Brown", role: "Editor", status: "Active", lastLogin: "2024-01-13" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        📊 DataView Component Capabilities
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          The DataView component provides advanced table functionality with built-in features 
          for data management, user interactions, and optimistic updates.
        </Typography>
      </Alert>

      {/* Feature Overview */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🎯 Key Features
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
          <Chip label="🔍 Smart Filtering" variant="outlined" />
          <Chip label="📄 Pagination" variant="outlined" />
          <Chip label="🔄 Sorting" variant="outlined" />
          <Chip label="☑️ Row Selection" variant="outlined" />
          <Chip label="⚡ Bulk Actions" variant="outlined" />
          <Chip label="🚀 Optimistic Updates" variant="outlined" />
          <Chip label="💾 Auto-save" variant="outlined" />
          <Chip label="🔄 Real-time Sync" variant="outlined" />
        </Stack>
      </Paper>

      {/* Sample Data Display */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          📋 Sample Data Structure
        </Typography>
        <Typography component="pre" variant="body2" sx={{ 
          fontFamily: "monospace", 
          backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100", 
          p: 2, 
          borderRadius: 1,
          overflow: "auto",
          fontSize: "0.85rem"
        }}>
{JSON.stringify(sampleData, null, 2)}
        </Typography>
      </Paper>

      {/* Live Example Reference */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🚀 See It In Action
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          To see the full DataView component in action, check out these live examples:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>👥 User Management Applet:</strong> Complete CRUD operations with real-time updates
          </Typography>
          <Typography variant="body2">
            <strong>🛍️ Product Catalog Applet:</strong> Advanced filtering, search, and bulk operations
          </Typography>
          <Typography variant="body2">
            <strong>📊 Analytics Dashboard:</strong> Data visualization with interactive tables
          </Typography>
        </Stack>
      </Paper>

      {/* Advanced Features */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          ⚡ Advanced Capabilities
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              🔄 Optimistic Updates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              UI updates immediately before API calls complete, with automatic rollback on errors.
              Provides instant feedback and smooth user experience.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              🎯 Smart Bulk Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select multiple rows and perform batch operations. Failed operations are automatically 
              retried or rolled back individually.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              🔍 Auto-Generated Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtering UI is automatically generated from API schemas. Supports text search, 
              dropdowns, date ranges, and custom field types.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              💾 Persistent State
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Table state (sorting, filters, pagination) is preserved in URL parameters. 
              Users can bookmark and share specific table views.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Implementation Example */}
      <Paper>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🔧 Implementation Example
        </Typography>
        <Typography component="pre" variant="body2" sx={{ 
          fontFamily: "monospace", 
          backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
          color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900", 
          p: 2, 
          borderRadius: 1,
          overflow: "auto",
          fontSize: "0.8rem"
        }}>
{`import { MuiDataViewApplet } from "@smbc/mui-applet-core";

const config = {
  dataView: {
    endpoint: "/api/users",
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "role", label: "Role", filterable: true },
      { key: "status", label: "Status", 
        render: (user) => (
          <Chip 
            label={user.status} 
            color={user.status === 'Active' ? 'success' : 'default'}
          />
        )
      }
    ]
  },
  actions: [
    {
      label: "Edit User",
      action: "edit",
      endpoint: "/api/users/{id}",
      optimistic: true
    },
    {
      label: "Delete User", 
      action: "delete",
      endpoint: "/api/users/{id}",
      confirmRequired: true
    }
  ],
  filters: {
    autoGenerate: true,
    fields: ["name", "role", "status"]
  }
};

<MuiDataViewApplet config={config} />`}
        </Typography>
      </Paper>
    </Box>
  );
};