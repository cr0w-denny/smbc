import React from "react";
import {
  Box,
  Typography,
  Paper,
  GridLegacy as Grid,
  Chip,
} from "@mui/material";
import {
  useUser,
  useAppletCore,
} from "@smbc/applet-core";

// Extended permission type for DevDashboard with role info
interface DevPermission {
  key: string;
  name: string;
  label: string;
  requiredRole: string;
  hasAccess: boolean;
}

interface DevPermissionGroup {
  id: string;
  label: string;
  icon?: any;
  permissions: DevPermission[];
}

export interface DevDashboardProps {
  appName: string;
  applets: Record<string, any>;
}

export function DevDashboard({ appName: _, applets }: DevDashboardProps) {
  const { user, availableRoles, setRoles } = useUser();
  const { roleUtils } = useAppletCore();

  // Track selected roles in state for the RoleManager
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(
    user?.roles || [],
  );

  // Update selected roles when user changes
  React.useEffect(() => {
    if (user?.roles) {
      setSelectedRoles(user.roles);
    }
  }, [user?.roles]);

  // Handle role toggle
  const toggleRole = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    setRoles(newRoles);
  };

  // Convert applets to permission groups for the DevDashboard
  const appletPermissions: DevPermissionGroup[] = React.useMemo(() => {
    return Object.entries(applets).map(([key, appletData]) => {
      // Get the applet info from the configuration
      const appletConfig = appletData as any;

      // Get permissions from the configuration
      const permissions = appletConfig.permissions || {};

      return {
        id: appletConfig.id || key,
        label: appletConfig.label || key,
        icon: appletConfig.icon,
        permissions: Object.entries(permissions).map(
          ([permName, requiredRole]) => {
            // Check if user has required role or higher in hierarchy
            const requiredRoleIndex = roleUtils.roles.indexOf(requiredRole as string);
            const hasAccess = selectedRoles.some(userRole => {
              const userRoleIndex = roleUtils.roles.indexOf(userRole);
              return userRoleIndex >= requiredRoleIndex;
            });
            
            return {
              key: permName,
              name: permName,
              label: permName
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              requiredRole: requiredRole as string,
              hasAccess,
            };
          },
        ),
      };
    });
  }, [applets, selectedRoles, roleUtils]);

  return (
    <Box>
      <Grid container spacing={3}>

        {/* Current User & Role Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current User & Roles
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
                  {availableRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      color={
                        selectedRoles.includes(role) ? "primary" : "default"
                      }
                      variant={
                        selectedRoles.includes(role) ? "filled" : "outlined"
                      }
                      onClick={() => toggleRole(role)}
                      sx={{
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 2, display: "block" }}
                >
                  Click roles to toggle them on/off
                </Typography>
              </Box>
            ) : (
              <Typography color="textSecondary">
                No user authenticated
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Full Permissions Matrix */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Permissions Matrix
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(6, 1fr)",
              }}
            >
              {appletPermissions.map((applet) => (
                <Paper key={applet.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    {applet.label}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {applet.permissions.map((perm) => (
                      <Chip
                        key={perm.key}
                        label={perm.label}
                        size="small"
                        color={perm.hasAccess ? "success" : "default"}
                        variant={perm.hasAccess ? "filled" : "outlined"}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
