import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, Box, Typography, MenuList, MenuItem, Divider, } from '@mui/material';
import { NotificationsNone, } from '@mui/icons-material';
// Simplified notification menu - shows empty state
export const NotificationMenu = ({ anchorEl, open, onClose, }) => {
    return (_jsxs(Menu, { anchorEl: anchorEl, open: open, onClose: onClose, PaperProps: {
            sx: {
                width: 360,
                maxHeight: 400,
            },
        }, anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
        }, transformOrigin: {
            vertical: 'top',
            horizontal: 'right',
        }, children: [_jsx(Box, { sx: { p: 2, pb: 1 }, children: _jsx(Typography, { variant: "h6", component: "h3", children: "Notifications" }) }), _jsx(Divider, {}), _jsx(MenuList, { sx: { py: 3 }, children: _jsxs(MenuItem, { disabled: true, sx: { justifyContent: 'center', flexDirection: 'column', gap: 1 }, children: [_jsx(NotificationsNone, { sx: { fontSize: 48, color: 'text.disabled' } }), _jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", children: "No notifications" })] }) })] }));
};
