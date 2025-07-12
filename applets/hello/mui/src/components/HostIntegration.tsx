import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Alert,
  GridLegacy as Grid,
  Divider,
} from "@mui/material";

export const HostIntegration: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Guide for host application developers to integrate applets into their
          applications.
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                📦
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Install Package
              </Typography>
              <Typography variant="body2">
                Add the applet packages to your project dependencies.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                ⚙️
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Configure Mount
              </Typography>
              <Typography variant="body2">
                Set up routing, permissions, and API configuration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                🚀
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Test & Deploy
              </Typography>
              <Typography variant="body2">
                Test the integration and deploy to production.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Installation
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography
              component="pre"
              variant="body2"
              sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
            >
              {`# Install the applet package
npm install @smbc/user-management-mui

# Install peer dependencies if needed
npm install @mui/material @emotion/react @emotion/styled`}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Basic Integration
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography
              component="pre"
              variant="body2"
              sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
            >
              {`import userManagementApplet from "@smbc/user-management-mui";
import { mountApplet } from "@smbc/applet-core";

// Configure the applet for your application
const appletConfig = mountApplet(userManagementApplet, {
  id: "user-management",                    // Unique identifier
  label: "User Management",                 // Display name
  path: "/users",                          // URL path
  icon: PeopleIcon,                        // Navigation icon
  apiBaseUrl: "https://api.yourapp.com",   // API endpoint
  permissions: [                           // Required permissions
    userManagementApplet.permissions.VIEW_USERS
  ],
});

// Add to your router configuration
const routes = [
  ...otherRoutes,
  {
    path: "/users/*",
    element: <AppletRenderer config={appletConfig} />
  }
];`}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Permission System
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Integrate with your existing authentication and authorization
                system.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Role-based:</strong> Map applet permissions to your
                  roles
                </Typography>
                <Typography variant="body2">
                  <strong>Dynamic:</strong> Permissions can change at runtime
                </Typography>
                <Typography variant="body2">
                  <strong>Granular:</strong> Control access to specific features
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                API Integration
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Connect applets to your existing API infrastructure.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>OpenAPI:</strong> Type-safe API client generation
                </Typography>
                <Typography variant="body2">
                  <strong>Flexible:</strong> Custom API adapters supported
                </Typography>
                <Typography variant="body2">
                  <strong>Caching:</strong> Built-in query caching with React
                  Query
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          💡 Best Practices
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Pin applet versions for stability
              </Typography>
              <Typography variant="body2">
                • Test integrations with mock APIs first
              </Typography>
              <Typography variant="body2">
                • Set up proper error boundaries
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Monitor bundle size impact
              </Typography>
              <Typography variant="body2">
                • Configure CSP headers appropriately
              </Typography>
              <Typography variant="body2">
                • Plan permission mapping early
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
