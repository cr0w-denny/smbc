/**
 * Pure AppToolbar component - no hooks or state management
 */

import React from "react";
import { Toolbar, Typography, IconButton, Badge, Box } from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import type { AppToolbarProps } from "./types";

export const AppToolbar: React.FC<AppToolbarProps> = ({
  title,
  showMenuButton = false,
  onMenuButtonClick,

  showUserMenu = false,
  userMenuAnchor,
  onUserMenuOpen,
  onUserMenuClose,
  userMenuContent,

  showNotifications = false,
  notificationCount = 0,
  notificationMenuAnchor,
  onNotificationMenuOpen,
  onNotificationMenuClose,
  notificationMenuContent,

  children,
}) => {
  return (
    <Toolbar>
      {/* Menu Button */}
      {showMenuButton && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuButtonClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Title */}
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>

      {/* Additional content */}
      {children}

      {/* Notification Menu */}
      {showNotifications && (
        <>
          <IconButton
            color="inherit"
            aria-label="notifications"
            onClick={onNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {notificationMenuContent && notificationMenuAnchor && (
            <Box component="div">
              {React.cloneElement(
                notificationMenuContent as React.ReactElement,
                {
                  anchorEl: notificationMenuAnchor,
                  open: Boolean(notificationMenuAnchor),
                  onClose: onNotificationMenuClose,
                },
              )}
            </Box>
          )}
        </>
      )}

      {/* User Menu */}
      {showUserMenu && (
        <>
          <IconButton
            color="inherit"
            aria-label="user account"
            onClick={onUserMenuOpen}
          >
            <AccountIcon />
          </IconButton>

          {userMenuContent && userMenuAnchor && (
            <Box component="div">
              {React.cloneElement(userMenuContent as React.ReactElement, {
                anchorEl: userMenuAnchor,
                open: Boolean(userMenuAnchor),
                onClose: onUserMenuClose,
              })}
            </Box>
          )}
        </>
      )}
    </Toolbar>
  );
};
