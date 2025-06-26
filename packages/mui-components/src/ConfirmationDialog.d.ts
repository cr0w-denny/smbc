import React from 'react';
export interface ConfirmationDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog should be closed */
    onClose: () => void;
    /** Callback when user confirms the action */
    onConfirm: () => void;
    /** Dialog title */
    title: string;
    /** Dialog content/message */
    message: string;
    /** Text for the confirm button */
    confirmText?: string;
    /** Text for the cancel button */
    cancelText?: string;
    /** Color variant for the confirm button */
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    /** Whether the confirm action is loading */
    loading?: boolean;
    /** Maximum width of the dialog */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
/**
 * A reusable confirmation dialog component for dangerous or important actions
 */
export declare const ConfirmationDialog: React.FC<ConfirmationDialogProps>;
