import React, { useCallback, useRef, useEffect } from "react";
import { Box } from "@mui/material";
import { SearchInput } from "@smbc/mui-components";

interface StableSearchInputProps {
  initialValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

/**
 * A search input that maintains its own internal state and focus
 * to prevent remounting issues from parent re-renders
 */
export const StableSearchInput: React.FC<StableSearchInputProps> = ({
  initialValue,
  onSearchChange,
  placeholder = "Search...",
}) => {
  const [internalValue, setInternalValue] = React.useState(initialValue);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Track component mount/unmount
  useEffect(() => {
    console.log('StableSearchInput: COMPONENT MOUNTED');
    return () => {
      console.log('StableSearchInput: COMPONENT UNMOUNTED');
    };
  }, []);

  // Only sync external value on initial mount, then ignore external changes
  // to prevent state conflicts during typing
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      setInternalValue(initialValue);
      hasInitialized.current = true;
    }
  }, [initialValue]);

  const handleChange = useCallback((value: string) => {
    console.log('StableSearchInput: handleChange called with:', value);
    setInternalValue(value);

    // Debounce the callback to parent
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      console.log('StableSearchInput: calling onSearchChange with:', value);
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Box mb={2}>
      <SearchInput
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        fullWidth
      />
    </Box>
  );
};