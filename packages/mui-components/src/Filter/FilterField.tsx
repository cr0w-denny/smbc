/**
 * Pure UI component for individual filter fields - no business logic or state
 */

import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { SearchInput } from '../SearchInput';
import type { FilterFieldConfig } from './types';

export interface FilterFieldProps {
  field: FilterFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  /** Whether to disable debouncing in individual field components (let parent handle it) */
  disableDebounce?: boolean;
}

export const FilterField: React.FC<FilterFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disableDebounce = false,
}) => {
  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  // Don't render hidden fields
  if (field.type === 'hidden' || field.hidden) {
    return null;
  }

  const commonProps = {
    disabled: field.disabled,
    size: field.size || 'small',
    fullWidth: field.fullWidth,
    error: !!error,
  };

  switch (field.type) {
    case 'search':
      return (
        <Box>
          <SearchInput
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || field.label}
            disabled={field.disabled}
            size={field.size}
            fullWidth={field.fullWidth}
            debounceMs={disableDebounce ? 0 : 300}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      );

    case 'select':
      return (
        <FormControl {...commonProps} sx={{ minWidth: 120 }}>
          <InputLabel shrink={true}>{field.label}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            label={field.label}
            displayEmpty
            notched
            renderValue={(selected) => {
              if (selected === '') {
                const emptyOption = field.options?.find(opt => opt.value === '');
                return emptyOption?.label || 'None';
              }
              const option = field.options?.find(opt => opt.value === selected);
              return option?.label || selected;
            }}
          >
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
      );

    case 'number':
      return (
        <TextField
          {...commonProps}
          type="number"
          label={field.label}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
          inputProps={{
            min: field.min,
            max: field.max,
          }}
          helperText={error}
        />
      );

    case 'boolean':
    case 'checkbox':
      return (
        <FormControl {...commonProps}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={field.disabled}
              />
            }
            label={field.label}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
      );

    case 'text':
    default:
      return (
        <TextField
          {...commonProps}
          label={field.label}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          helperText={error}
        />
      );
  }
};