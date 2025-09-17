import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import { NavigationItem } from "../types";
import { TreeDropdownMenu } from "./TreeDropdownMenu";
import { UserMenu, UserRole } from "./UserMenu";

interface TopNavProps {
  logo?: React.ReactNode;
  /** Optional hamburger menu for mobile/drawer navigation */
  hamburgerMenu?: React.ReactNode;
  navigation: NavigationItem[];
  onNavigate?: (href: string) => void;
  /** Current path for active navigation highlighting */
  currentPath?: string;
  /** Whether dark mode is currently enabled */
  isDarkMode?: boolean;
  /** Callback when dark mode toggle changes */
  onDarkModeToggle?: (enabled: boolean) => void;
  /** User display name */
  username?: string;
  /** User avatar URL */
  avatarUrl?: string;
  /** Additional components to render before the user menu */
  right?: React.ReactNode;
  /** Color for active navigation indicators */
  activeColor?: string;
  /** Maximum width for toolbar content with responsive breakpoints */
  maxWidth?:
    | string
    | { xs?: string; sm?: string; md?: string; lg?: string; xl?: string };
  /** User roles for persona management */
  userRoles?: UserRole[];
  /** Callback when a user role is toggled */
  onToggleRole?: (roleId: string, enabled: boolean) => void;
  /** User menu action handlers */
  onProfile?: () => void;
  onSettings?: () => void;
  onQuickGuide?: () => void;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  hamburgerMenu,
  navigation,
  onNavigate,
  currentPath,
  isDarkMode,
  onDarkModeToggle,
  username,
  avatarUrl,
  right,
  activeColor,
  maxWidth,
  userRoles,
  onToggleRole,
  onProfile,
  onSettings,
  onQuickGuide,
  onLogout,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    label: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(label);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const handleNavigation = (href?: string) => {
    if (href && onNavigate) {
      onNavigate(href);
    }
    handleMenuClose();
  };

  const renderNavItem = (item: NavigationItem, index: number) => {
    // Check if item is active or if any dropdown items are active
    // Support nested paths (e.g., /events should be active for /events/detail)
    const isActive = item.href === currentPath || 
      (currentPath && item.href !== '/' && currentPath.startsWith(item.href + '/'));
    const hasActiveChild =
      item.type === "dropdown" &&
      item.items?.some((subItem) => subItem.href === currentPath);
    const showActiveIndicator = isActive || hasActiveChild;

    switch (item.type) {
      case "link":
        return (
          <Box key={index} sx={{ position: "relative", mr: 2 }}>
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (item.onClick) item.onClick();
                handleNavigation(item.href);
              }}
              sx={{
                textTransform: "none",
                fontFamily: "Roboto",
                fontSize: "17px",
                fontWeight: 600, // semibold
              }}
            >
              {item.label}
            </Button>
            {showActiveIndicator && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  height: 5,
                  bgcolor: activeColor || "primary.main",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </Box>
        );

      case "dropdown":
        return (
          <Box key={index} sx={{ position: "relative", mr: 2 }}>
            <Button
              onClick={(e) => handleMenuOpen(e, item.label)}
              endIcon={<ArrowDropDownIcon />}
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                fontFamily: "Roboto",
                fontSize: "17px",
                fontWeight: 600, // semibold
              }}
            >
              {item.label}
            </Button>
            {showActiveIndicator && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  height: 5,
                  bgcolor: activeColor || "primary.main",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && activeMenu === item.label}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: { "& .MuiMenuItem-root": { minHeight: "auto" } },
                },
              }}
            >
              {item.items?.map((subItem, subIndex) => (
                <MenuItem
                  key={subIndex}
                  onClick={() => {
                    if (subItem.onClick) subItem.onClick();
                    handleNavigation(subItem.href);
                  }}
                >
                  {subItem.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        );

      case "tree-dropdown":
        return (
          <Box key={index} sx={{ mr: 2 }}>
            <Button
              onClick={(e) => handleMenuOpen(e, item.label)}
              endIcon={<ArrowDropDownIcon />}
              color="inherit"
              size="small"
            >
              {item.label}
            </Button>
            <TreeDropdownMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && activeMenu === item.label}
              onClose={handleMenuClose}
              items={item.treeItems || []}
              menuId={item.label}
            />
          </Box>
        );

      case "button":
        return (
          <Button
            key={index}
            variant={item.variant || "contained"}
            color={item.color || "primary"}
            size="small"
            onClick={() => {
              if (item.onClick) item.onClick();
              handleNavigation(item.href);
            }}
          >
            {item.label}
          </Button>
        );

      default:
        return null;
    }
  };

  const centerNavItems = navigation;
  const rightNavItems: any[] = [];

  return (
    <AppBar position="fixed" sx={{ height: "104px", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense" sx={{ height: "100%", p: "0 !important" }}>
        {/* Max-width container for header content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: maxWidth || "1200px",
            mx: "auto",
          }}
        >
          {/* Left Section - Logo and potential hamburger menu */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            {hamburgerMenu}
            {logo ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>{logo}</Box>
            ) : (
              <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
                Dashboard
              </Typography>
            )}
          </Box>

          {/* Center Section - Main Navigation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {centerNavItems.map(renderNavItem)}
            </Box>
          </Box>

          {/* Right Section - Button items, additional components, and user menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            {rightNavItems.map(renderNavItem)}
            {right}
            <IconButton
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                color: "inherit",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              aria-controls={userMenuAnchor ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuAnchor ? "true" : undefined}
            >
              {avatarUrl ? (
                <Avatar src={avatarUrl} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircleOutlined sx={{ fontSize: 32 }} />
              )}
            </IconButton>
            <UserMenu
              open={Boolean(userMenuAnchor)}
              anchorEl={userMenuAnchor}
              onClose={() => setUserMenuAnchor(null)}
              name={username || "User"}
              avatarUrl={avatarUrl}
              onToggleDarkMode={onDarkModeToggle}
              darkMode={isDarkMode}
              userRoles={userRoles}
              onToggleRole={onToggleRole}
              onProfile={onProfile}
              onSettings={onSettings}
              onQuickGuide={onQuickGuide}
              onLogout={onLogout}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
