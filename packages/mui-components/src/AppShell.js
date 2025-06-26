import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, useTheme, useMediaQuery, } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle as AccountIcon, } from '@mui/icons-material';
import { useApp, useSidebar, useNotifications } from '@smbc/mui-applet-core';
import { NavigationDrawer } from './NavigationDrawer';
import { UserMenu } from './UserMenu';
import { NotificationMenu } from './NotificationMenu';
const DRAWER_WIDTH = 280;
export const AppShell = ({ children, title = 'SMBC Application', hideNavigation = false, elevation = 1, }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { state } = useApp();
    const sidebar = useSidebar();
    const { unreadCount } = useNotifications();
    const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
    const [notificationMenuAnchor, setNotificationMenuAnchor] = React.useState(null);
    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };
    const handleNotificationMenuOpen = (event) => {
        setNotificationMenuAnchor(event.currentTarget);
    };
    const handleNotificationMenuClose = () => {
        setNotificationMenuAnchor(null);
    };
    const shouldShowDrawer = !hideNavigation && state.navigation.length > 0;
    const drawerOpen = shouldShowDrawer && (isMobile ? sidebar.isOpen : true);
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [_jsx(AppBar, { position: "fixed", elevation: elevation, sx: {
                    width: shouldShowDrawer && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
                    ml: shouldShowDrawer && !isMobile ? `${DRAWER_WIDTH}px` : 0,
                    zIndex: theme.zIndex.drawer + 1,
                }, children: _jsxs(Toolbar, { children: [shouldShowDrawer && isMobile && (_jsx(IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: sidebar.toggle, sx: { mr: 2 }, children: _jsx(MenuIcon, {}) })), _jsx(Typography, { variant: "h6", noWrap: true, component: "div", sx: { flexGrow: 1 }, children: title }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsxs(IconButton, { color: "inherit", "aria-label": `${unreadCount} notifications`, onClick: handleNotificationMenuOpen, sx: { position: 'relative' }, children: [_jsx(NotificationsIcon, {}), unreadCount > 0 && (_jsx(Box, { sx: {
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'error.main',
                                                color: 'error.contrastText',
                                                borderRadius: '50%',
                                                width: 16,
                                                height: 16,
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 16,
                                            }, children: unreadCount > 99 ? '99+' : unreadCount }))] }), _jsx(IconButton, { color: "inherit", "aria-label": "user menu", onClick: handleUserMenuOpen, children: _jsx(AccountIcon, {}) })] })] }) }), shouldShowDrawer && (_jsx(NavigationDrawer, { open: drawerOpen, onClose: sidebar.close, width: DRAWER_WIDTH, variant: isMobile ? 'temporary' : 'permanent' })), _jsx(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: shouldShowDrawer && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
                    ml: shouldShowDrawer && !isMobile ? `${DRAWER_WIDTH}px` : 0,
                    mt: '64px', // Account for AppBar height
                }, children: children }), _jsx(UserMenu, { anchorEl: userMenuAnchor, open: Boolean(userMenuAnchor), onClose: handleUserMenuClose }), _jsx(NotificationMenu, { anchorEl: notificationMenuAnchor, open: Boolean(notificationMenuAnchor), onClose: handleNotificationMenuClose })] }));
};
