import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

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
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  showClearButton = true,
  debounceMs = 300,
  size = 'medium',
  fullWidth = false,
  textFieldProps = {},
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color={disabled ? 'disabled' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: showClearButton && localValue && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                disabled={disabled}
                size={size === 'small' ? 'small' : 'medium'}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          ...textFieldProps?.InputProps,
        }}
      />
    </Box>
  );
};
