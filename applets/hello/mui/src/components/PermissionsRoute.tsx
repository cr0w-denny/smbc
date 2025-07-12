import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface PermissionsRouteProps {
  currentRoute?: {
    emoji?: string;
    title?: string;
    permission?: {
      name?: string;
    };
  };
}

export const PermissionsRoute: React.FC<PermissionsRouteProps> = ({
  currentRoute,
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Permission System & Role Mappings
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            How Permissions Work
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            SMBC applets use a{" "}
            <strong>hierarchical role-based permission system</strong> where
            permissions are mapped to minimum required roles. Each applet
            defines its own permissions, and hosts map these to their role
            hierarchy.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Permission Definition Pattern
          </Typography>
          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// In applet: permissions.ts
export default {
  VIEW_USERS: {
    id: "user-management:view-users",
    name: "View Users",
    description: "View user list and details"
  },
  EDIT_USERS: {
    id: "user-management:edit-users", 
    name: "Edit Users",
    description: "Modify user information"
  }
}`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Role Hierarchy & Mapping
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Hosts define role hierarchies and map permissions to minimum
            required roles:
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Host role hierarchy (implicit inheritance)
const HOST_ROLES = [
  "Guest",      // Least privileged
  "Customer", 
  "Staff",
  "Manager", 
  "Admin",
  "SuperAdmin"  // Most privileged
];

// Permission requirements mapping
const permissionRequirements = {
  VIEW_USERS: "Staff",    // Staff and above can view
  EDIT_USERS: "Manager",  // Manager and above can edit
  DELETE_USERS: "Admin"   // Admin and above can delete
};`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Automatic Permission Inheritance
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>Higher roles inherit all lower role permissions</strong>
              </li>
              <li>
                A "Manager" automatically has all "Staff" and "Customer"
                permissions
              </li>
              <li>
                Permission checks use:{" "}
                <code>
                  roleHierarchy.indexOf(userRole) {">"}=
                  roleHierarchy.indexOf(requiredRole)
                </code>
              </li>
              <li>No need to explicitly list all permissions for each role</li>
            </ul>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Multi-Instance Applet Permissions
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The same applet can be mounted multiple times with different
            permission contexts:
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Regular user management - standard permissions
"user-management": {
  VIEW_USERS: "Staff",
  EDIT_USERS: "Manager"
},

// Admin user management - elevated permissions
"admin-users": {
  VIEW_USERS: "Admin",
  EDIT_USERS: "SuperAdmin"
}`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Runtime Permission Checking
          </Typography>
          <Typography component="div" variant="body1">
            <strong>Automatic UI Updates:</strong>
            <ul>
              <li>Navigation items filtered by permissions</li>
              <li>Action buttons shown/hidden based on user role</li>
              <li>Routes blocked if insufficient permissions</li>
              <li>Forms disable fields user can't modify</li>
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
            {`// In components
const { hasPermission } = usePermissions();

// Permission check for actions
if (hasPermission(permissions.EDIT_USERS)) {
  // Show edit button
}

// Route definitions with permissions
const routes = [
  {
    path: "/admin",
    permission: permissions.MANAGE_ROLES,
    label: "Admin Panel",
    icon: "⚙️"
  }
];

// Actions automatically check permissions
actions: {
  row: [{
    key: "edit",
    label: "Edit",
    requiredPermissions: [permissions.EDIT_USERS]
  }]
}`}
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
            🛡️ This applet requires "{currentRoute?.permission?.name}"
            permission, which is why you can see this content.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
