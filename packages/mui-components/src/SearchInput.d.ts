import React from 'react';
export interface SearchInputProps {
    /** Current search value */
    value: string;
    /** Callback when search value changes */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Whether to show the clear button when there's text */
    showClearButton?: boolean;
    /** Debounce delay in milliseconds */
    debounceMs?: number;
    /** Size variant */
    size?: 'small' | 'medium';
    /** Full width */
    fullWidth?: boolean;
    /** Additional props to pass to TextField */
    textFieldProps?: any;
}
/**
 * A reusable search input component with built-in debouncing and clear functionality
 */
export declare const SearchInput: React.FC<SearchInputProps>;
