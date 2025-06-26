import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Button, Stack, } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
/**
 * A reusable empty state component for tables, lists, and search results
 */
export const EmptyState = ({ icon, title, description, primaryAction, secondaryAction, type = 'custom', sx = {}, }) => {
    // Default icons based on type
    const getDefaultIcon = () => {
        switch (type) {
            case 'search':
                return _jsx(SearchIcon, { sx: { fontSize: 64, color: 'text.secondary' } });
            case 'create':
                return _jsx(AddIcon, { sx: { fontSize: 64, color: 'text.secondary' } });
            case 'error':
                return _jsx(RefreshIcon, { sx: { fontSize: 64, color: 'text.secondary' } });
            default:
                return null;
        }
    };
    const displayIcon = icon || getDefaultIcon();
    return (_jsxs(Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            textAlign: 'center',
            py: 4,
            px: 2,
            ...sx,
        }, children: [displayIcon && (_jsx(Box, { sx: { mb: 2 }, children: displayIcon })), _jsx(Typography, { variant: "h6", component: "h3", gutterBottom: true, color: "text.primary", children: title }), description && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { maxWidth: 400, mb: 3 }, children: description })), (primaryAction || secondaryAction) && (_jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 2 }, children: [secondaryAction && (_jsx(Button, { variant: secondaryAction.variant || 'outlined', color: secondaryAction.color || 'primary', onClick: secondaryAction.onClick, disabled: secondaryAction.disabled, children: secondaryAction.label })), primaryAction && (_jsx(Button, { variant: primaryAction.variant || 'contained', color: primaryAction.color || 'primary', onClick: primaryAction.onClick, disabled: primaryAction.disabled, children: primaryAction.label }))] }))] }));
};
