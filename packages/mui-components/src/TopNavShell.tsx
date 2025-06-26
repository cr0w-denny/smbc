import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle,
} from '@mui/icons-material';
import { useApp, type NavigationItem } from '@smbc/mui-applet-core';
import { useNavigation, useRoleManagement } from '@smbc/mui-applet-core/host';
import { UserMenu } from './UserMenu';

export interface TopNavShellProps {
  children?: React.ReactNode;
  logo?: React.ReactNode;
  appName?: string;
  hideNavigation?: boolean;
  elevation?: number;
}

interface NavDropdownProps {
  item: NavigationItem;
  onItemClick?: (item: NavigationItem) => void;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ item, onItemClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { hasPermission } = useRoleManagement();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (item.children && item.children.length > 0) {
      setAnchorEl(event.currentTarget);
    } else if (item.path) {
      onItemClick?.(item);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (childItem: NavigationItem) => {
    handleClose();
    onItemClick?.(childItem);
  };

  // Check access for this item

  if (item.requiredPermissions && item.appletId && 
      !item.requiredPermissions.some(permission => hasPermission(item.appletId!, permission))) {
    return null;
  }

  // Filter children based on role/permission access
  const visibleChildren = item.children?.filter(child => {
    if (child.requiredPermissions && child.appletId && 
        !child.requiredPermissions.some(permission => hasPermission(child.appletId!, permission))) {
      return false;
    }
    return true;
  }) || [];

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        endIcon={item.children && item.children.length > 0 ? <ExpandMoreIcon /> : undefined}
        sx={{
          mx: 1,
          textTransform: 'none',
          fontWeight: 500,
        }}
      >
        {item.label}
        {item.badge && (
          <Box
            component="span"
            sx={{
              ml: 1,
              backgroundColor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              minWidth: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {item.badge}
          </Box>
        )}
      </Button>
      {visibleChildren.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {visibleChildren.map((child, index) => (
            <React.Fragment key={child.id}>
              {child.divider && index > 0 && <Divider />}
              <MenuItem onClick={() => handleMenuItemClick(child)}>
                {child.icon && (
                  <ListItemIcon>
                    {React.isValidElement(child.icon) ? child.icon : <child.icon />}
                  </ListItemIcon>
                )}
                <ListItemText>{child.label}</ListItemText>
                {child.badge && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {child.badge}
                  </Box>
                )}
              </MenuItem>
            </React.Fragment>
          ))}
        </Menu>
      )}
    </>
  );
};

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ open, onClose, navigation, onItemClick }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { hasPermission } = useRoleManagement();

  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      handleToggleExpand(item.id);
    } else {
      onClose();
      onItemClick?.(item);
    }
  };

  const renderNavItem = (item: NavigationItem, level = 0) => {

    if (item.requiredPermissions && item.appletId && 
        !item.requiredPermissions.some(permission => hasPermission(item.appletId!, permission))) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const visibleChildren = item.children?.filter(child => {
      if (child.requiredPermissions && child.appletId && 
          !child.requiredPermissions.some(permission => hasPermission(child.appletId!, permission))) {
        return false;
      }
      return true;
    }) || [];

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{ pl: 2 + level * 2 }}
          >
            {item.icon && (
              <ListItemIcon>
                {React.isValidElement(item.icon) ? item.icon : <item.icon />}
              </ListItemIcon>
            )}
            <ListItemText primary={item.label} />
            {item.badge && (
              <Box
                component="span"
                sx={{
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  mr: 1,
                }}
              >
                {item.badge}
              </Box>
            )}
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {visibleChildren.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navigation.map(item => renderNavItem(item))}
        </List>
      </Box>
    </Drawer>
  );
};

export const TopNavShell: React.FC<TopNavShellProps> = ({
  children,
  logo,
  appName = 'SMBC Application',
  hideNavigation = false,
  elevation = 1,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { state } = useApp();
  const { navigation } = useNavigation();

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.path) {
      // In a real app, this would use React Router or similar
      console.log('Navigate to:', item.path);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={elevation}>
        <Toolbar>
          {/* Left side: Logo and App Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {logo && (
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {logo}
              </Box>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {appName}
            </Typography>
          </Box>

          {/* Center: Navigation Menu */}
          {!hideNavigation && !isMobile && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flex: 1,
              mx: 4,
            }}>
              {navigation.map((item: NavigationItem) => (
                <NavDropdown
                  key={item.id}
                  item={item}
                  onItemClick={handleNavigationClick}
                />
              ))}
            </Box>
          )}

          {/* Mobile menu button */}
          {!hideNavigation && isMobile && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Right side: User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {state.user ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  sx={{ ml: 1 }}
                >
                  {state.user.avatar ? (
                    <Avatar
                      src={state.user.avatar}
                      alt={state.user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <UserMenu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                />
              </>
            ) : (
              <Button color="inherit" variant="outlined">
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      {!hideNavigation && isMobile && (
        <MobileNavDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          navigation={navigation}
          onItemClick={handleNavigationClick}
        />
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};
