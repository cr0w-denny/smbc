import React, { useCallback } from "react";
import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

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
  size?: "small" | "medium";
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
  placeholder = "Search...",
  disabled = false,
  showClearButton = true,
  debounceMs = 300,
  size = "medium",
  fullWidth = false,
  textFieldProps = {},
}) => {

  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const isTypingRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wasFocusedRef = React.useRef(false);

  // Handle focus and blur events to track focus state
  const handleFocus = React.useCallback(() => {
    wasFocusedRef.current = true;
  }, []);

  const handleBlur = React.useCallback(() => {
    wasFocusedRef.current = false;
    isTypingRef.current = false;
  }, []);

  // Restore focus after remounting if it was previously focused
  React.useEffect(() => {
    if (wasFocusedRef.current && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  });

  // Sync external value changes, but only when not actively typing
  React.useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  // Debounced onChange with improved StrictMode resilience
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Skip debouncing if value hasn't actually changed
    if (localValue === value) {
      return;
    }

    // Mark as typing when local value changes
    isTypingRef.current = true;

    debounceRef.current = setTimeout(() => {
      // Only call onChange if component is still mounted and value is current
      if (localValue !== value) {
        onChange(localValue);
      }
      // Mark typing as done after debounce completes
      isTypingRef.current = false;
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, onChange, value, debounceMs]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setLocalValue(newValue);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    // Reset typing state when clearing
    isTypingRef.current = false;
  }, [onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClear();
      }
    },
    [handleClear],
  );

  return (
    <Box>
      <TextField
        {...textFieldProps}
        inputRef={inputRef}
        value={localValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color={disabled ? "disabled" : "action"} />
            </InputAdornment>
          ),
          endAdornment: showClearButton && localValue && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                disabled={disabled}
                size={size === "small" ? "small" : "medium"}
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
