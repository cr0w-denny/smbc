import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
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
  useTheme,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import { motion } from "motion/react";
import { NavigationItem } from "../types";
import { TreeDropdownMenu } from "./TreeDropdownMenu";
import { UserMenu, UserRole } from "../../UserMenu";
import { ui, color, shadow } from "@smbc/ui-core";

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
  username?: string | React.ReactNode;
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
  /** Whether user is currently impersonating (dev mode) */
  isImpersonating?: boolean;
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
  maxWidth,
  userRoles,
  onToggleRole,
  onProfile,
  onSettings,
  onQuickGuide,
  onLogout,
  isImpersonating,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [indicatorDimensions, setIndicatorDimensions] = useState<{
    width: number;
    x: number;
  } | null>(null);
  const theme = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Calculate and set header height as CSS custom property
  useLayoutEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--appshell-header-height",
        `${height}px`,
      );
    }
  });

  // Calculate indicator position for active nav item
  useEffect(() => {
    if (!currentPath) return;

    const activeIndex = navigation.findIndex((item) => {
      if (item.href && currentPath.startsWith(item.href)) {
        return true;
      }
      if (item.type === "dropdown" && item.items) {
        return item.items.some(
          (subItem) => subItem.href && currentPath.startsWith(subItem.href),
        );
      }
      return false;
    });

    if (activeIndex !== -1) {
      const activeRef = navItemRefs.current[activeIndex];
      const container = navContainerRef.current;

      if (activeRef && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeRef.getBoundingClientRect();

        const newDimensions = {
          width: activeRect.width,
          x: activeRect.left - containerRect.left,
        };

        setIndicatorDimensions(newDimensions);
      }
    } else {
      setIndicatorDimensions(null);
    }
  }, [currentPath, navigation]);

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
    switch (item.type) {
      case "link":
        return (
          <Box
            key={index}
            ref={(el) => {
              navItemRefs.current[index] = el as HTMLDivElement | null;
            }}
            sx={{ position: "relative", mr: 2 }}
          >
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (item.onClick) item.onClick();
                handleNavigation(item.href);
              }}
              sx={{
                textTransform: "none",
                fontSize: "17px",
                fontWeight: 600, // semibold
                color: theme.palette.mode === "dark" ? "#EBEBEB" : "#FFFFFF",
              }}
            >
              {item.label}
            </Button>
          </Box>
        );

      case "dropdown":
        return (
          <Box
            key={index}
            ref={(el) => {
              navItemRefs.current[index] = el as HTMLDivElement | null;
            }}
            sx={{ position: "relative", mr: 2 }}
          >
            <Button
              onClick={(e) => handleMenuOpen(e, item.label)}
              endIcon={<ArrowDropDownIcon />}
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "17px",
                fontWeight: 600, // semibold
                color: theme.palette.mode === "dark" ? "#EBEBEB" : "#FFFFFF",
              }}
            >
              {item.label}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && activeMenu === item.label}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    minWidth: 150,
                    mt: "15px",
                    boxShadow: shadow.md,
                    backgroundColor: ui.color.background.secondary(theme),
                    border: `1px solid ${ui.color.border.primary(theme)}`,
                    color: ui.color.text.primary,
                    "& .MuiMenuItem-root": { minHeight: "auto" },
                  },
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color:
                      theme.palette.mode === "dark" ? "#E6E7E8" : "#1A1A1A",
                    pr: subItem.icon ? "16px" : 0,
                    "&:hover": {
                      backgroundColor: "transparent",
                      "& .menu-item-text": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#524747" : "#E8E6E6",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      color:
                        theme.palette.mode === "dark" ? "#98A4B9" : "#5A6A7A",
                    },
                    "& .menu-item-text": {
                      borderRadius: "4px",
                      padding: "2px 6px",
                      marginLeft: "-6px",
                      marginRight: subItem.icon ? "-6px" : "10px",
                      marginTop: "-2px",
                      marginBottom: "-2px",
                      display: "block",
                      flex: 1,
                    },
                  }}
                >
                  {subItem.icon && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      {subItem.icon}
                    </Box>
                  )}
                  <span className="menu-item-text">{subItem.label}</span>
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
    <AppBar
      ref={headerRef}
      position="fixed"
      sx={{
        /* Avoid popover induced layout shift */
        padding: "0 !important",
        height: "104px",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        "--Paper-overlay": "none !important",
        "--Paper-elevation": "none !important",
        backgroundColor: `${ui.navigation.background} !important`,
        borderBottom: "3px solid #02080b",
        color: `${ui.navigation.color} !important`,
        boxShadow: shadow.base,
        borderRadius: 0,
        "&::before": {
          display: "none",
        },
      }}
    >
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
            <Box
              ref={navContainerRef}
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              {centerNavItems.map(renderNavItem)}
              {indicatorDimensions && (
                <Box
                  component={motion.div}
                  animate={{
                    x: indicatorDimensions.x,
                    width: indicatorDimensions.width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="nav-active-indicator"
                  sx={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    height: 5,
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(90deg, #27A0E4 0%, #7BDEE9 100%)"
                        : "#73ABFB",
                    borderRadius: "2px 2px 0 0",
                    pointerEvents: "none",
                  }}
                />
              )}
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
                color: theme.palette.mode === "dark" ? "#98A4B9" : "#D0D1D2",
                padding: "8px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                ...(isImpersonating && {
                  border: `2px solid ${color.brand.freshGreen}`,
                  borderRadius: "50%",
                  padding: "6px", // Reduced to account for 2px border
                }),
              }}
              aria-controls={userMenuAnchor ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuAnchor ? "true" : undefined}
            >
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 32,
                    height: 32,
                    ...(isImpersonating && {
                      border: `2px solid ${color.brand.freshGreen}`,
                    }),
                  }}
                />
              ) : (
                <AccountCircleOutlined
                  sx={{
                    fontSize: 32,
                    color: isImpersonating
                      ? color.brand.freshGreen
                      : theme.palette.mode === "dark"
                      ? "#98A4B9"
                      : "#D0D1D2",
                  }}
                />
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
