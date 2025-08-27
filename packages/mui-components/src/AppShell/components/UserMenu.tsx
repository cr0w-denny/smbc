import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Avatar,
  Divider,
} from "@mui/material";
import {
  AccountCircleOutlined as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

interface UserMenuProps {
  /** Whether dark mode is currently enabled */
  isDarkMode?: boolean;
  /** Callback when dark mode toggle changes */
  onDarkModeToggle?: (enabled: boolean) => void;
  /** User display name */
  username?: string;
  /** User avatar URL */
  avatarUrl?: string;
  /** Additional menu items */
  additionalItems?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isDarkMode = false,
  onDarkModeToggle,
  username = "User",
  avatarUrl,
  additionalItems = [],
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDarkModeToggle = () => {
    if (onDarkModeToggle) {
      onDarkModeToggle(!isDarkMode);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "inherit",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {avatarUrl ? (
          <Avatar src={avatarUrl} sx={{ width: 32, height: 32 }} />
        ) : (
          <AccountCircleIcon sx={{ fontSize: 32 }} />
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 200,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* User Info */}
        <MenuItem disabled sx={{ opacity: "1 !important" }}>
          <ListItemIcon>
            {avatarUrl ? (
              <Avatar src={avatarUrl} sx={{ width: 24, height: 24 }} />
            ) : (
              <AccountCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary={username} />
        </MenuItem>

        <Divider />

        {/* Dark Mode Toggle */}
        <MenuItem onClick={handleDarkModeToggle}>
          <ListItemIcon>
            {isDarkMode ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch
            checked={isDarkMode}
            onChange={handleDarkModeToggle}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </MenuItem>

        {/* Additional Items */}
        {additionalItems.length > 0 && (
          <>
            <Divider />
            {additionalItems.map((item, index) => (
              <MenuItem key={index} onClick={item.onClick}>
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </>
        )}

        <Divider />

        {/* Settings */}
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        {/* Logout */}
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
