import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton, } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
/**
 * A reusable confirmation dialog component for dangerous or important actions
 */
export const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'primary', loading = false, maxWidth = 'sm', }) => {
    const handleConfirm = () => {
        onConfirm();
    };
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: maxWidth, fullWidth: true, "aria-labelledby": "confirmation-dialog-title", "aria-describedby": "confirmation-dialog-description", children: [_jsxs(DialogTitle, { id: "confirmation-dialog-title", sx: { pr: 6 }, children: [title, _jsx(IconButton, { "aria-label": "close", onClick: onClose, sx: {
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { children: _jsx(DialogContentText, { id: "confirmation-dialog-description", children: message }) }), _jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [_jsx(Button, { onClick: onClose, disabled: loading, variant: "outlined", children: cancelText }), _jsx(Button, { onClick: handleConfirm, color: confirmColor, variant: "contained", disabled: loading, autoFocus: true, children: loading ? 'Processing...' : confirmText })] })] }));
};
