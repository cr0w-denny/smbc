import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Typography, Chip, Card, CardContent, styled, ToggleButton, } from '@mui/material';
import { Security as SecurityIcon, Person as PersonIcon, } from '@mui/icons-material';
const Permission = styled(Chip) `
  font-weight: bold;
`;
/**
 * A comprehensive dashboard for visualizing and managing role-based permissions.
 *
 * Features:
 * - Interactive role selection with toggle buttons
 * - Real-time permission matrix showing access across applets
 * - Current user information display
 * - Responsive grid layout for permission cards
 * - Optional localStorage persistence for role selection
 * - Customizable applet groupings with icons
 */
export function RolePermissionDashboard({ user, availableRoles, selectedRoles, onRoleToggle, appletPermissions, title = 'Role & Permissions', showUserInfo = true, persistRoles = true, localStorageKey = 'rolePermissionDashboard-selectedRoles', }) {
    // Save selected roles to localStorage whenever they change
    React.useEffect(() => {
        if (!persistRoles)
            return;
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(selectedRoles));
        }
        catch (error) {
            console.warn('Failed to save selected roles to localStorage:', error);
        }
    }, [selectedRoles, persistRoles, localStorageKey]);
    return (_jsxs(Box, { children: [_jsxs(Box, { sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }, children: [_jsxs(Typography, { variant: "h4", children: [_jsx(SecurityIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), title] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Typography, { variant: "h6", children: "Roles:" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 }, children: availableRoles.map((role) => (_jsx(ToggleButton, { value: role, selected: selectedRoles.includes(role), onChange: () => onRoleToggle(role), size: "small", sx: { textTransform: 'none' }, children: role }, role))) })] })] }), showUserInfo && user && (_jsx(Box, { sx: { mb: 3 }, children: _jsx(Card, { sx: { maxWidth: 600 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, children: [_jsx(PersonIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "Current User"] }), user.name && (_jsxs(Typography, { children: [_jsx("strong", { children: "Name:" }), " ", user.name] })), user.email && (_jsxs(Typography, { children: [_jsx("strong", { children: "Email:" }), " ", user.email] })), _jsxs(Box, { sx: { mt: 1 }, children: [_jsx("strong", { children: "Active Roles:" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }, children: selectedRoles.map((role) => (_jsx(Chip, { label: role, color: "primary", size: "small" }, role))) })] })] }) }) })), _jsx(Typography, { variant: "h5", gutterBottom: true, sx: { mt: 3 }, children: "Permissions by Module" }), _jsx(Box, { sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                        lg: 'repeat(6, 1fr)',
                    },
                    gap: 2,
                }, children: appletPermissions.map((applet) => {
                    const IconComponent = applet.icon || PersonIcon;
                    return (_jsx(Card, { sx: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 280,
                        }, children: _jsxs(CardContent, { sx: {
                                pb: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                            }, children: [_jsxs(Typography, { variant: "subtitle1", gutterBottom: true, sx: {
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        mb: 2,
                                        minHeight: '1.5em',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }, children: [_jsx(IconComponent, { sx: {
                                                mr: 0.5,
                                                fontSize: '1.2rem',
                                            } }), applet.label] }), _jsx(Box, { sx: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        flexGrow: 1,
                                    }, children: applet.permissions.map((permission) => (_jsx(Permission, { label: permission.label, color: permission.hasAccess ? 'success' : 'default', variant: permission.hasAccess ? 'filled' : 'outlined', size: "small", sx: {
                                            justifyContent: 'center',
                                            width: '100%',
                                            '& .MuiChip-label': {
                                                textAlign: 'center',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%',
                                            },
                                        } }, permission.key))) })] }) }, applet.id));
                }) })] }));
}
