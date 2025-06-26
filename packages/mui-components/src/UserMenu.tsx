import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useUser } from '@smbc/mui-applet-core';
import { useRoleManagement } from '@smbc/mui-applet-core/host';

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, open, onClose }) => {
  const { user, setRoles, availableRoles } = useUser();
  const { userRoles } = useRoleManagement();

  const handleRoleChange = (role: string) => {
    // Toggle the role in the user's roles array
    const isCurrentlySelected = userRoles.includes(role);
    const newRoles = isCurrentlySelected 
      ? userRoles.filter((r: string) => r !== role)
      : [...userRoles, role];
    
    setRoles(newRoles);
    onClose();
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    onClose();
  };

  const handleSettings = () => {
    // TODO: Implement settings logic
    console.log('Settings clicked');
    onClose();
  };

  const handleProfile = () => {
    // TODO: Implement profile logic
    console.log('Profile clicked');
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          minWidth: 220,
          mt: 1,
        },
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Current Role */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Current Role
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {userRoles.map((role: string) => (
            <Chip key={role} label={role} size="small" color="primary" />
          ))}
        </Box>
      </Box>

      {/* Role Switching */}
      {availableRoles.length > 1 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Switch Role
            </Typography>
          </Box>
          {availableRoles.map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleRoleChange(role)}
              selected={userRoles.includes(role)}
              sx={{ pl: 3 }}
            >
              <ListItemIcon>
                <SecurityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={role} />
            </MenuItem>
          ))}
        </>
      )}

      <Divider />

      {/* Menu Items */}
      <MenuItem onClick={handleProfile}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>

      <MenuItem onClick={handleSettings}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );
};
