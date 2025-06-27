/**
 * Pure AppMainContent component - handles layout calculations
 */

import React from 'react';
import { Box, Toolbar } from '@mui/material';
import type { AppMainContentProps } from './types';

export const AppMainContent: React.FC<AppMainContentProps> = ({
  children,
  drawerWidth = 280,
  showDrawer = false,
  isMobile = false,
}) => {
  const mainContentStyles = {
    flexGrow: 1,
    p: 3,
    width: showDrawer && !isMobile ? `calc(100% - ${drawerWidth}px)` : '100%',
    ml: showDrawer && !isMobile ? `${drawerWidth}px` : 0,
    transition: 'margin 0.3s ease, width 0.3s ease',
  };

  return (
    <Box
      component="main"
      sx={mainContentStyles}
    >
      {/* Spacer for fixed AppBar */}
      <Toolbar />
      
      {/* Main content */}
      {children}
    </Box>
  );
};