import React from 'react';
export interface EmptyStateProps {
    /** Icon to display */
    icon?: React.ReactNode;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Primary action button */
    primaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'contained' | 'outlined' | 'text';
        color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
        disabled?: boolean;
    };
    /** Secondary action button */
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'contained' | 'outlined' | 'text';
        color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
        disabled?: boolean;
    };
    /** Predefined empty state type */
    type?: 'search' | 'create' | 'error' | 'custom';
    /** Custom styles */
    sx?: any;
}
/**
 * A reusable empty state component for tables, lists, and search results
 */
export declare const EmptyState: React.FC<EmptyStateProps>;
