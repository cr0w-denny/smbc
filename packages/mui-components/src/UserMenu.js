import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Avatar, Box, Chip, } from '@mui/material';
import { Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon, Security as SecurityIcon, } from '@mui/icons-material';
import { useUser } from '@smbc/mui-applet-core';
import { useRoleManagement } from '@smbc/mui-applet-core/host';
export const UserMenu = ({ anchorEl, open, onClose }) => {
    const { user, setRoles, availableRoles } = useUser();
    const { userRoles } = useRoleManagement();
    const handleRoleChange = (role) => {
        // Toggle the role in the user's roles array
        const isCurrentlySelected = userRoles.includes(role);
        const newRoles = isCurrentlySelected
            ? userRoles.filter((r) => r !== role)
            : [...userRoles, role];
        setRoles(newRoles);
        onClose();
    };
    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout clicked');
        onClose();
    };
    const handleSettings = () => {
        // TODO: Implement settings logic
        console.log('Settings clicked');
        onClose();
    };
    const handleProfile = () => {
        // TODO: Implement profile logic
        console.log('Profile clicked');
        onClose();
    };
    if (!user) {
        return null;
    }
    return (_jsxs(Menu, { anchorEl: anchorEl, open: open, onClose: onClose, anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
        }, transformOrigin: {
            vertical: 'top',
            horizontal: 'right',
        }, PaperProps: {
            sx: {
                minWidth: 220,
                mt: 1,
            },
        }, children: [_jsxs(Box, { sx: { px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Avatar, { sx: { width: 32, height: 32 }, children: user.name.charAt(0).toUpperCase() }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", noWrap: true, children: user.name }), _jsx(Typography, { variant: "caption", color: "text.secondary", noWrap: true, children: user.email })] })] }), _jsx(Divider, {}), _jsxs(Box, { sx: { px: 2, py: 1 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Current Role" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }, children: userRoles.map((role) => (_jsx(Chip, { label: role, size: "small", color: "primary" }, role))) })] }), availableRoles.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Divider, {}), _jsx(Box, { sx: { px: 2, py: 0.5 }, children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Switch Role" }) }), availableRoles.map((role) => (_jsxs(MenuItem, { onClick: () => handleRoleChange(role), selected: userRoles.includes(role), sx: { pl: 3 }, children: [_jsx(ListItemIcon, { children: _jsx(SecurityIcon, { fontSize: "small" }) }), _jsx(ListItemText, { primary: role })] }, role)))] })), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleProfile, children: [_jsx(ListItemIcon, { children: _jsx(PersonIcon, { fontSize: "small" }) }), _jsx(ListItemText, { primary: "Profile" })] }), _jsxs(MenuItem, { onClick: handleSettings, children: [_jsx(ListItemIcon, { children: _jsx(SettingsIcon, { fontSize: "small" }) }), _jsx(ListItemText, { primary: "Settings" })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleLogout, children: [_jsx(ListItemIcon, { children: _jsx(LogoutIcon, { fontSize: "small" }) }), _jsx(ListItemText, { primary: "Logout" })] })] }));
};
