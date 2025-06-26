import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { TextField, InputAdornment, IconButton, Box, } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
/**
 * A reusable search input component with built-in debouncing and clear functionality
 */
export const SearchInput = ({ value, onChange, placeholder = 'Search...', disabled = false, showClearButton = true, debounceMs = 300, size = 'medium', fullWidth = false, textFieldProps = {}, }) => {
    const [localValue, setLocalValue] = React.useState(value);
    const debounceRef = React.useRef();
    // Sync external value changes
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);
    // Debounced onChange
    React.useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [localValue, debounceMs, onChange, value]);
    const handleInputChange = (event) => {
        setLocalValue(event.target.value);
    };
    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            handleClear();
        }
    };
    return (_jsx(Box, { children: _jsx(TextField, { ...textFieldProps, value: localValue, onChange: handleInputChange, onKeyDown: handleKeyDown, placeholder: placeholder, disabled: disabled, size: size, fullWidth: fullWidth, InputProps: {
                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { color: disabled ? 'disabled' : 'action' }) })),
                endAdornment: showClearButton && localValue && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { "aria-label": "clear search", onClick: handleClear, disabled: disabled, size: size === 'small' ? 'small' : 'medium', edge: "end", children: _jsx(ClearIcon, {}) }) })),
                ...textFieldProps?.InputProps,
            } }) }));
};
