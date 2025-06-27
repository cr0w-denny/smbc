/**
 * Connected AppShell component with state management and hooks
 */

import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { AppShell, type AppShellProps } from '@smbc/mui-components';
import { useAppShell } from './AppShellProvider';

export interface ConnectedAppShellProps 
  extends Omit<AppShellProps, 'drawerOpen' | 'onDrawerClose' | 'isMobile' | 'toolbarProps'> {
  // Override toolbar props to add state management
  enableUserMenu?: boolean;
  enableNotifications?: boolean;
  onUserMenuAction?: (action: string) => void;
  onNotificationAction?: (notificationId: string) => void;
}

export const ConnectedAppShell: React.FC<ConnectedAppShellProps> = ({
  enableUserMenu = false,
  enableNotifications = false,
  onUserMenuAction,
  onNotificationAction,
  ...appShellProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    drawerOpen,
    closeDrawer,
    toggleDrawer,
    userMenuAnchor,
    openUserMenu,
    closeUserMenu,
    notificationMenuAnchor,
    openNotificationMenu,
    closeNotificationMenu,
    notificationCount,
  } = useAppShell();

  const toolbarProps = {
    showMenuButton: appShellProps.showDrawer,
    onMenuButtonClick: toggleDrawer,
    
    showUserMenu: enableUserMenu,
    userMenuAnchor,
    onUserMenuOpen: openUserMenu,
    onUserMenuClose: closeUserMenu,
    
    showNotifications: enableNotifications,
    notificationCount,
    notificationMenuAnchor,
    onNotificationMenuOpen: openNotificationMenu,
    onNotificationMenuClose: closeNotificationMenu,
  };

  return (
    <AppShell
      {...appShellProps}
      drawerOpen={drawerOpen}
      onDrawerClose={closeDrawer}
      isMobile={isMobile}
      toolbarProps={toolbarProps}
    />
  );
};