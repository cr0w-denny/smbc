/**
 * Pure NavigationDrawer component - just the drawer UI, no business logic
 */

import React from 'react';
import {
  Drawer,
  Toolbar,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import type { NavigationDrawerProps } from './types';

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
  width,
  variant = 'temporary',
  title = 'Navigation',
  children,
}) => {
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
      </Toolbar>
      
      <Divider />
      
      {/* Navigation content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};