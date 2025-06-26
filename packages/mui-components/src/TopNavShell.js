import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider, useTheme, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemButton, Collapse, Avatar, } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Menu as MenuIcon, ExpandLess, ExpandMore, AccountCircle, } from '@mui/icons-material';
import { useApp } from '@smbc/mui-applet-core';
import { useNavigation, useRoleManagement } from '@smbc/mui-applet-core/host';
import { UserMenu } from './UserMenu';
const NavDropdown = ({ item, onItemClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { hasPermission } = useRoleManagement();
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        if (item.children && item.children.length > 0) {
            setAnchorEl(event.currentTarget);
        }
        else if (item.path) {
            onItemClick?.(item);
        }
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMenuItemClick = (childItem) => {
        handleClose();
        onItemClick?.(childItem);
    };
    // Check access for this item
    if (item.requiredPermissions && item.appletId &&
        !item.requiredPermissions.some(permission => hasPermission(item.appletId, permission))) {
        return null;
    }
    // Filter children based on role/permission access
    const visibleChildren = item.children?.filter(child => {
        if (child.requiredPermissions && child.appletId &&
            !child.requiredPermissions.some(permission => hasPermission(child.appletId, permission))) {
            return false;
        }
        return true;
    }) || [];
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { color: "inherit", onClick: handleClick, endIcon: item.children && item.children.length > 0 ? _jsx(ExpandMoreIcon, {}) : undefined, sx: {
                    mx: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                }, children: [item.label, item.badge && (_jsx(Box, { component: "span", sx: {
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
                        }, children: item.badge }))] }), visibleChildren.length > 0 && (_jsx(Menu, { anchorEl: anchorEl, open: open, onClose: handleClose, MenuListProps: {
                    'aria-labelledby': 'basic-button',
                }, transformOrigin: { horizontal: 'left', vertical: 'top' }, anchorOrigin: { horizontal: 'left', vertical: 'bottom' }, children: visibleChildren.map((child, index) => (_jsxs(React.Fragment, { children: [child.divider && index > 0 && _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => handleMenuItemClick(child), children: [child.icon && (_jsx(ListItemIcon, { children: React.isValidElement(child.icon) ? child.icon : _jsx(child.icon, {}) })), _jsx(ListItemText, { children: child.label }), child.badge && (_jsx(Box, { component: "span", sx: {
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
                                    }, children: child.badge }))] })] }, child.id))) }))] }));
};
const MobileNavDrawer = ({ open, onClose, navigation, onItemClick }) => {
    const [expandedItems, setExpandedItems] = useState(new Set());
    const { hasPermission } = useRoleManagement();
    const handleToggleExpand = (itemId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        }
        else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };
    const handleItemClick = (item) => {
        if (item.children && item.children.length > 0) {
            handleToggleExpand(item.id);
        }
        else {
            onClose();
            onItemClick?.(item);
        }
    };
    const renderNavItem = (item, level = 0) => {
        if (item.requiredPermissions && item.appletId &&
            !item.requiredPermissions.some(permission => hasPermission(item.appletId, permission))) {
            return null;
        }
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const visibleChildren = item.children?.filter(child => {
            if (child.requiredPermissions && child.appletId &&
                !child.requiredPermissions.some(permission => hasPermission(child.appletId, permission))) {
                return false;
            }
            return true;
        }) || [];
        return (_jsxs(React.Fragment, { children: [_jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { onClick: () => handleItemClick(item), sx: { pl: 2 + level * 2 }, children: [item.icon && (_jsx(ListItemIcon, { children: React.isValidElement(item.icon) ? item.icon : _jsx(item.icon, {}) })), _jsx(ListItemText, { primary: item.label }), item.badge && (_jsx(Box, { component: "span", sx: {
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
                                }, children: item.badge })), hasChildren && (isExpanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}))] }) }), hasChildren && (_jsx(Collapse, { in: isExpanded, timeout: "auto", unmountOnExit: true, children: _jsx(List, { component: "div", disablePadding: true, children: visibleChildren.map(child => renderNavItem(child, level + 1)) }) }))] }, item.id));
    };
    return (_jsx(Drawer, { anchor: "left", open: open, onClose: onClose, sx: {
            '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
            },
        }, children: _jsx(Box, { sx: { overflow: 'auto' }, children: _jsx(List, { children: navigation.map(item => renderNavItem(item)) }) }) }));
};
export const TopNavShell = ({ children, logo, appName = 'SMBC Application', hideNavigation = false, elevation = 1, }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const { state } = useApp();
    const { navigation } = useNavigation();
    const handleNavigationClick = (item) => {
        if (item.path) {
            // In a real app, this would use React Router or similar
            console.log('Navigate to:', item.path);
        }
    };
    const handleMobileMenuToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };
    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: [_jsx(AppBar, { position: "static", elevation: elevation, children: _jsxs(Toolbar, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', flexShrink: 0 }, children: [logo && (_jsx(Box, { sx: { mr: 2, display: 'flex', alignItems: 'center' }, children: logo })), _jsx(Typography, { variant: "h6", component: "div", sx: {
                                        fontWeight: 600,
                                        letterSpacing: 0.5,
                                    }, children: appName })] }), !hideNavigation && !isMobile && (_jsx(Box, { sx: {
                                display: 'flex',
                                justifyContent: 'center',
                                flex: 1,
                                mx: 4,
                            }, children: navigation.map((item) => (_jsx(NavDropdown, { item: item, onItemClick: handleNavigationClick }, item.id))) })), !hideNavigation && isMobile && (_jsx(Box, { sx: { flex: 1, display: 'flex', justifyContent: 'center' }, children: _jsx(IconButton, { color: "inherit", onClick: handleMobileMenuToggle, sx: { ml: 2 }, children: _jsx(MenuIcon, {}) }) })), _jsx(Box, { sx: { display: 'flex', alignItems: 'center', flexShrink: 0 }, children: state.user ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { color: "inherit", onClick: handleUserMenuOpen, sx: { ml: 1 }, children: state.user.avatar ? (_jsx(Avatar, { src: state.user.avatar, alt: state.user.name, sx: { width: 32, height: 32 } })) : (_jsx(AccountCircle, {})) }), _jsx(UserMenu, { anchorEl: userMenuAnchor, open: Boolean(userMenuAnchor), onClose: handleUserMenuClose })] })) : (_jsx(Button, { color: "inherit", variant: "outlined", children: "Sign In" })) })] }) }), !hideNavigation && isMobile && (_jsx(MobileNavDrawer, { open: mobileDrawerOpen, onClose: () => setMobileDrawerOpen(false), navigation: navigation, onItemClick: handleNavigationClick })), _jsx(Box, { component: "main", sx: { flexGrow: 1, overflow: 'auto' }, children: children })] }));
};
