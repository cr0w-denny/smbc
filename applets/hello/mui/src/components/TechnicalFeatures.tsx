import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Paper,
  Alert,
  GridLegacy as Grid,
} from "@mui/material";

export const TechnicalFeatures: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Technical overview of applet architecture and key features for
          developers.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Hash-Based Navigation
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Applets use hash navigation for deep linking and state
                persistence.
              </Typography>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === "dark" 
                  ? theme.palette.background.paper 
                  : "grey.50",
                border: (theme) => theme.palette.mode === "dark" 
                  ? "1px solid rgba(255, 255, 255, 0.08)" 
                  : "none",
                mb: 2 
              }}>
                <Typography
                  component="pre"
                  variant="body2"
                  sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                >
                  {`#/hello/try-it-out
#/products?search=laptop
#/users/123/edit`}
                </Typography>
              </Paper>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1 }}
              >
                <Chip
                  label="Bookmarkable URLs"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label="Browser Integration"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label="State Persistence"
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Permission System
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Role-based access control with fine-grained permissions.
              </Typography>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === "dark" 
                  ? theme.palette.background.paper 
                  : "grey.50",
                border: (theme) => theme.palette.mode === "dark" 
                  ? "1px solid rgba(255, 255, 255, 0.08)" 
                  : "none",
                mb: 2 
              }}>
                <Typography
                  component="pre"
                  variant="body2"
                  sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                >
                  {`{
  path: "/admin",
  permission: "ADMIN_ACCESS",
  label: "Admin Panel"
}`}
                </Typography>
              </Paper>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1 }}
              >
                <Chip label="Dynamic Routes" size="small" variant="outlined" />
                <Chip
                  label="Role Inheritance"
                  size="small"
                  variant="outlined"
                />
                <Chip label="Menu Filtering" size="small" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Data Management
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Built-in components for common data operations.
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>AutoFilter:</strong> Generate filtering UI from API
                  schemas
                </Typography>
                <Typography variant="body2">
                  <strong>DataView:</strong> Tables with sorting, pagination,
                  bulk actions
                </Typography>
                <Typography variant="body2">
                  <strong>React Query:</strong> Caching, optimistic updates,
                  error handling
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Development Tools
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Complete development and testing environment.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1, mb: 2 }}
              >
                <Chip
                  label="Mock Service Worker"
                  size="small"
                  variant="outlined"
                />
                <Chip label="TypeScript" size="small" variant="outlined" />
                <Chip label="Vitest Testing" size="small" variant="outlined" />
                <Chip label="Storybook" size="small" variant="outlined" />
                <Chip label="Vite Build" size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Toggle the "Mock" switch in the header to see mock/real API
                switching.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          Integration Example
        </Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
            color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.85rem",
          }}
        >
          {`// Import the applet package from npm
import userManagementApplet from "@smbc/user-management-mui";
import { mountApplet } from "@smbc/applet-core";

// Method 1: Using the mountApplet helper
const appletConfig = mountApplet(userManagementApplet, {
  id: "user-management",           // Unique identifier for this applet instance
  label: "User Management",        // Display name in navigation
  path: "/users",                  // URL path where applet will be mounted
  icon: PeopleIcon,                // Icon component for sidebar/navigation
  permissions: [                   // Required permissions to access this applet
    userManagementApplet.permissions.VIEW_USERS
  ],
  version: userManagementApplet.version,  // Applet version for compatibility
});

// Method 2: Manual configuration with custom routes
const appletMount = {
  id: "user-management",
  label: "User Management",
  apiBaseUrl: getApiUrl("user-management", "production"),  // API endpoint URL
  routes: [{
    path: "/users",                // Route path within the applet
    label: "Users",                // Navigation label for this route
    component: () =>               // Factory function - enables lazy loading & multiple instances
      userManagementApplet.component({ 
        mountPath: "/users"        // Path context passed to applet at render time
      }),
    requiredPermissions: [         // Permissions needed for this route
      userManagementApplet.permissions.VIEW_USERS.id
    ],
  }]
};`}
        </Typography>
      </Paper>
    </Box>
  );
};
