import React from "react";
import { Box, Typography, Paper, Card, CardContent, Stack, Chip, Alert } from "@mui/material";
import { useApp } from "@smbc/applet-core";

export const PermissionsDemo: React.FC = () => {
  const { state, roleUtils } = useApp();
  const user = state.user;

  const samplePermissions = [
    { name: "VIEW_USERS", description: "View user list and profiles" },
    { name: "EDIT_USERS", description: "Edit user information" },
    { name: "DELETE_USERS", description: "Delete user accounts" },
    { name: "MANAGE_ROLES", description: "Assign and modify user roles" },
    { name: "VIEW_ANALYTICS", description: "Access analytics dashboard" },
    { name: "EXPORT_DATA", description: "Export system data" },
  ];

  const sampleRoles = [
    { 
      name: "Viewer", 
      permissions: ["VIEW_USERS", "VIEW_ANALYTICS"],
      description: "Read-only access to most features"
    },
    { 
      name: "Editor", 
      permissions: ["VIEW_USERS", "EDIT_USERS", "VIEW_ANALYTICS"],
      description: "Can view and edit data"
    },
    { 
      name: "Admin", 
      permissions: ["VIEW_USERS", "EDIT_USERS", "DELETE_USERS", "MANAGE_ROLES", "VIEW_ANALYTICS", "EXPORT_DATA"],
      description: "Full system access"
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🔐 Role-Based Access Control System
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This demonstrates how applets handle user permissions and role-based access control. 
          Routes and features are dynamically filtered based on user permissions.
        </Typography>
      </Alert>

      {/* Current User Info */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          👤 Current User Session
        </Typography>
        {user ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Roles:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
                {user.roles?.map((role) => (
                  <Chip key={role} label={role} color="primary" size="small" />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>Permissions:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {user.permissions?.map((permission) => (
                  <Chip key={permission} label={permission} variant="outlined" size="small" />
                ))}
              </Stack>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No user session active (this would show user info in a real application)
          </Typography>
        )}
      </Paper>

      {/* Permission System Overview */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        📋 Sample Permission System
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {sampleRoles.map((role) => (
          <Card key={role.name} variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "secondary.main" }}>
                {role.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {role.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {role.permissions.map((permission) => (
                  <Chip 
                    key={permission} 
                    label={permission} 
                    size="small" 
                    variant="outlined"
                    color={user?.permissions?.includes(permission) ? "success" : "default"}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Available Permissions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        🛡️ Available Permissions
      </Typography>

      <Stack spacing={1} sx={{ mb: 3 }}>
        {samplePermissions.map((permission) => (
          <Paper key={permission.name} sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {permission.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {permission.description}
                </Typography>
              </Box>
              <Chip 
                label={user?.permissions?.includes(permission.name) ? "✓ Granted" : "✗ Denied"}
                color={user?.permissions?.includes(permission.name) ? "success" : "error"}
                variant={user?.permissions?.includes(permission.name) ? "filled" : "outlined"}
                size="small"
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Role Utilities Demo */}
      <Paper sx={{ 
        p: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" ? "warning.dark" : "warning.50", 
        border: "1px solid", 
        borderColor: (theme) => theme.palette.mode === "dark" ? "warning.700" : "warning.200" 
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "warning.dark" }}>
          🔧 Role Utilities Demo
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          The roleUtils provide helper functions for permission checking:
        </Typography>
        
        <Stack spacing={1}>
          <Typography variant="body2">
            <code>hasPermission("hello", "VIEW_ROUTE_ONE")</code>: {" "}
            <Chip 
              label={roleUtils.hasPermission(user?.roles || [], "hello", "VIEW_ROUTE_ONE") ? "true" : "false"}
              color={roleUtils.hasPermission(user?.roles || [], "hello", "VIEW_ROUTE_ONE") ? "success" : "error"}
              size="small"
            />
          </Typography>
          <Typography variant="body2">
            <code>hasRole(["Admin"])</code>: {" "}
            <Chip 
              label={roleUtils.hasRole(user?.roles || [], ["Admin"]) ? "true" : "false"}
              color={roleUtils.hasRole(user?.roles || [], ["Admin"]) ? "success" : "error"}
              size="small"
            />
          </Typography>
          <Typography variant="body2">
            <code>hasAnyPermission("hello", ["VIEW_ROUTE_TWO", "VIEW_ROUTE_THREE"])</code>: {" "}
            <Chip 
              label={roleUtils.hasAnyPermission(user?.roles || [], "hello", ["VIEW_ROUTE_TWO", "VIEW_ROUTE_THREE"]) ? "true" : "false"}
              color={roleUtils.hasAnyPermission(user?.roles || [], "hello", ["VIEW_ROUTE_TWO", "VIEW_ROUTE_THREE"]) ? "success" : "error"}
              size="small"
            />
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          💡 Implementation Pattern
        </Typography>
        <Typography component="pre" variant="body2" sx={{ 
          fontFamily: "monospace", 
          backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
          color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900", 
          p: 2, 
          borderRadius: 1,
          overflow: "auto",
          fontSize: "0.85rem"
        }}>
{`// Route with permission requirement
{
  path: "/admin-panel",
  permission: "MANAGE_SYSTEM",
  label: "Admin Panel",
  icon: "⚙️"
}

// Component-level permission check
const { roleUtils } = useApp();

if (!roleUtils.canAccess("VIEW_ANALYTICS")) {
  return <AccessDenied />;
}

// Conditional rendering
{roleUtils.hasRole("Admin") && (
  <AdminControls />
)}`}
        </Typography>
      </Paper>
    </Box>
  );
};