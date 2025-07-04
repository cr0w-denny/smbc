import {
  Box,
  Typography,
  Paper,
  GridLegacy as Grid,
  Chip,
} from "@mui/material";
import { useUser } from "@smbc/applet-core";

export interface DevDashboardProps {
  appName: string;
  applets: Record<string, any>;
}

export function DevDashboard({ appName, applets }: DevDashboardProps) {
  const { user, availableRoles } = useUser();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {appName} - Development Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Development tools and information for inspecting your host application
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Current User Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current User
            </Typography>
            {user ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {user.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Roles:</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {user.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography color="textSecondary">
                No user authenticated
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Available Roles */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Roles
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {availableRoles.map((role) => (
                <Chip key={role} label={role} size="small" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Available Applets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Applets ({Object.keys(applets).length})
            </Typography>
            {Object.keys(applets).length === 0 ? (
              <Typography color="textSecondary">
                Add applets to your configuration in{" "}
                <code>src/app.config.ts</code>
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {Object.values(applets).map((applet: any) => (
                  <Grid item key={applet.id} xs={12} sm={6} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {applet.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        Path: {applet.path}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {applet.id}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Quick Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
            <Typography variant="body2" color="textSecondary">
              💡 This development dashboard is provided by{" "}
              <code>@smbc/mui-applet-devtools</code>. It helps you inspect user
              roles, permissions, and available applets during development.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
