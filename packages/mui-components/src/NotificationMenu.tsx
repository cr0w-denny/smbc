import React from 'react';
import {
  Menu,
  Box,
  Typography,
  MenuList,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  NotificationsNone,
} from '@mui/icons-material';

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

// Simplified notification menu - shows empty state
export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 400,
        },
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" component="h3">
          Notifications
        </Typography>
      </Box>
      
      <Divider />

      {/* Empty state */}
      <MenuList sx={{ py: 3 }}>
        <MenuItem disabled sx={{ justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <NotificationsNone sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" align="center">
            No notifications
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
