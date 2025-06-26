import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Divider, Toolbar, Typography, Badge, Box, useTheme, } from '@mui/material';
import { ExpandLess, ExpandMore, ChevronRight, Home as HomeIcon, } from '@mui/icons-material';
import { useNavigation, useRoleManagement } from '@smbc/mui-applet-core/host';
const NavigationTreeItem = ({ item, level = 0, onNavigate, }) => {
    const theme = useTheme();
    const { hasPermission } = useRoleManagement();
    const [expanded, setExpanded] = React.useState(false);
    // Get current path from URL hash for active state
    const currentPath = React.useMemo(() => {
        const hash = window.location.hash;
        if (!hash || hash === '#')
            return '/';
        const hashContent = hash.slice(1);
        const queryIndex = hashContent.indexOf('?');
        return queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
    }, []);
    // Check if user has required permissions
    if (item.requiredPermissions && item.appletId &&
        !item.requiredPermissions.some(permission => hasPermission(item.appletId, permission))) {
        return null;
    }
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path === currentPath;
    const isParentOfActive = item.children?.some(child => child.path === currentPath ||
        child.children?.some(grandchild => grandchild.path === currentPath));
    const handleClick = () => {
        if (hasChildren) {
            setExpanded(!expanded);
        }
        else if (item.path) {
            if (item.external) {
                window.open(item.path, '_blank', 'noopener,noreferrer');
            }
            else {
                onNavigate?.(item.path);
            }
        }
    };
    const IndentLevel = level * 16;
    return (_jsxs(_Fragment, { children: [item.divider && _jsx(Divider, { sx: { my: 1 } }), _jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { onClick: handleClick, selected: isActive, sx: {
                        pl: 2 + IndentLevel / 8,
                        backgroundColor: isActive ? 'action.selected' : 'transparent',
                        borderLeft: isActive || isParentOfActive ? `3px solid ${theme.palette.primary.main}` : 'none',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }, children: [_jsx(ListItemIcon, { sx: { minWidth: 40 }, children: item.icon ? (_jsx(item.icon, {})) : hasChildren ? (expanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {})) : (_jsx(ChevronRight, {})) }), _jsx(ListItemText, { primary: item.label, primaryTypographyProps: {
                                variant: level === 0 ? 'body1' : 'body2',
                                fontWeight: isActive ? 'medium' : 'regular',
                            } }), item.badge && (_jsx(Badge, { badgeContent: item.badge, color: "primary", sx: { mr: 1 } })), hasChildren && (_jsx(Box, { sx: { ml: 1 }, children: expanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}) }))] }) }), hasChildren && (_jsx(Collapse, { in: expanded, timeout: "auto", unmountOnExit: true, children: _jsx(List, { component: "div", disablePadding: true, children: item.children?.map((child) => (_jsx(NavigationTreeItem, { item: child, level: level + 1, onNavigate: onNavigate }, child.id))) }) }))] }));
};
export const NavigationDrawer = ({ open, onClose, width, variant = 'temporary', }) => {
    const { navigation } = useNavigation();
    const handleNavigate = (path) => {
        // In a real app, this would use react-router or similar
        console.log('Navigate to:', path);
        if (variant === 'temporary') {
            onClose();
        }
    };
    const drawerContent = (_jsxs(Box, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx(Toolbar, { children: _jsx(Typography, { variant: "h6", noWrap: true, component: "div", children: "Navigation" }) }), _jsx(Divider, {}), _jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsxs(List, { children: [_jsx(NavigationTreeItem, { item: {
                                id: 'home',
                                label: 'Dashboard',
                                icon: HomeIcon,
                                path: '/',
                            }, onNavigate: handleNavigate }), navigation.length > 0 && _jsx(Divider, { sx: { my: 1 } }), navigation.map((item) => (_jsx(NavigationTreeItem, { item: item, onNavigate: handleNavigate }, item.id)))] }) })] }));
    return (_jsx(Drawer, { variant: variant, open: open, onClose: onClose, sx: {
            width: width,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: width,
                boxSizing: 'border-box',
            },
        }, ModalProps: {
            keepMounted: true, // Better open performance on mobile
        }, children: drawerContent }));
};
