import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  styled,
  ToggleButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { 
  Permission as BasePermission, 
  AppletPermissionGroup as BaseAppletPermissionGroup 
} from '@smbc/mui-applet-core';

const Permission = styled(Chip)`
  font-weight: bold;
`;

export interface User {
  name?: string;
  email?: string;
}

// Re-export with MUI icon compatibility
export interface Permission extends BasePermission {}

export interface AppletPermissionGroup extends Omit<BaseAppletPermissionGroup, 'icon'> {
  icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
}

export interface RolePermissionDashboardProps {
  /** Current user information */
  user?: User;
  /** Available roles that can be selected */
  availableRoles: string[];
  /** Currently active/selected roles */
  selectedRoles: string[];
  /** Function called when roles are toggled */
  onRoleToggle: (role: string) => void;
  /** Applet permission groups to display */
  appletPermissions: AppletPermissionGroup[];
  /** Optional title for the dashboard */
  title?: string;
  /** Whether to show the current user info section */
  showUserInfo?: boolean;
  /** Whether to persist selected roles to localStorage */
  persistRoles?: boolean;
  /** LocalStorage key for persisting roles */
  localStorageKey?: string;
}

/**
 * A comprehensive dashboard for visualizing and managing role-based permissions.
 * 
 * Features:
 * - Interactive role selection with toggle buttons
 * - Real-time permission matrix showing access across applets
 * - Current user information display
 * - Responsive grid layout for permission cards
 * - Optional localStorage persistence for role selection
 * - Customizable applet groupings with icons
 */
export function RolePermissionDashboard({
  user,
  availableRoles,
  selectedRoles,
  onRoleToggle,
  appletPermissions,
  title = 'Role & Permissions',
  showUserInfo = true,
  persistRoles = true,
  localStorageKey = 'rolePermissionDashboard-selectedRoles',
}: RolePermissionDashboardProps) {
  // Save selected roles to localStorage whenever they change
  React.useEffect(() => {
    if (!persistRoles) return;
    
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(selectedRoles));
    } catch (error) {
      console.warn('Failed to save selected roles to localStorage:', error);
    }
  }, [selectedRoles, persistRoles, localStorageKey]);

  return (
    <Box>
      {/* Header with role chooser on the right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Roles:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableRoles.map((role) => (
              <ToggleButton
                key={role}
                value={role}
                selected={selectedRoles.includes(role)}
                onChange={() => onRoleToggle(role)}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {role}
              </ToggleButton>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Current User Info */}
      {showUserInfo && user && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ maxWidth: 600 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current User
              </Typography>
              {user.name && (
                <Typography>
                  <strong>Name:</strong> {user.name}
                </Typography>
              )}
              {user.email && (
                <Typography>
                  <strong>Email:</strong> {user.email}
                </Typography>
              )}
              <Box sx={{ mt: 1 }}>
                <strong>Active Roles:</strong>
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                >
                  {selectedRoles.map((role) => (
                    <Chip key={role} label={role} color="primary" size="small" />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Permissions by Module */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Permissions by Module
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
        }}
      >
        {appletPermissions.map((applet) => {
          const IconComponent = applet.icon || PersonIcon;
          return (
            <Card
              key={applet.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 280,
              }}
            >
              <CardContent
                sx={{
                  pb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    mb: 2,
                    minHeight: '1.5em',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconComponent
                    sx={{
                      mr: 0.5,
                      fontSize: '1.2rem',
                    }}
                  />
                  {applet.label}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    flexGrow: 1,
                  }}
                >
                  {applet.permissions.map((permission) => (
                    <Permission
                      key={permission.key}
                      label={permission.label}
                      color={permission.hasAccess ? 'success' : 'default'}
                      variant={permission.hasAccess ? 'filled' : 'outlined'}
                      size="small"
                      sx={{
                        justifyContent: 'center',
                        width: '100%',
                        '& .MuiChip-label': {
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}