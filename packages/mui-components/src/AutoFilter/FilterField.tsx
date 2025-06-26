/**
 * Individual filter field components that map to different input types
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
import { FilterFieldConfig, FilterValues } from './types';

interface FilterFieldProps {
  field: FilterFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

export const FilterField: React.FC<FilterFieldProps> = ({
  field,
  value,
  onChange,
  error,
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
    size: field.size || 'medium',
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
            placeholder={field.placeholder}
            disabled={field.disabled}
            debounceMs={field.debounceMs}
            size={field.size}
            fullWidth={field.fullWidth}
          />
          {error && (
            <FormHelperText error>{error}</FormHelperText>
          )}
        </Box>
      );

    case 'text':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          helperText={error}
        />
      );

    case 'number':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type="number"
          value={value || ''}
          onChange={(e) => {
            const numValue = e.target.value === '' ? undefined : Number(e.target.value);
            handleChange(numValue);
          }}
          placeholder={field.placeholder}
          required={field.required}
          helperText={error}
          inputProps={{
            min: field.min,
            max: field.max,
            step: 'any',
          }}
        />
      );

    case 'select':
      return (
        <FormControl {...commonProps} error={!!error}>
          <InputLabel required={field.required}>{field.label}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            label={field.label}
          >
            {!field.required && (
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
            )}
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={field.disabled}
              size={field.size}
            />
          }
          label={field.label}
        />
      );

    default:
      return (
        <TextField
          {...commonProps}
          label={field.label}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          helperText={error}
        />
      );
  }
};

/**
 * Multi-field component for rendering multiple fields in a row
 */
interface FilterFieldGroupProps {
  fields: FilterFieldConfig[];
  values: FilterValues;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
  spacing?: number;
  direction?: 'row' | 'column';
  wrap?: boolean;
}

export const FilterFieldGroup: React.FC<FilterFieldGroupProps> = ({
  fields,
  values,
  onChange,
  errors,
  spacing = 2,
  direction = 'row',
  wrap = true,
}) => {
  const visibleFields = fields.filter(field => field.type !== 'hidden' && !field.hidden);

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: spacing,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: 'flex-start',
      }}
    >
      {visibleFields.map((field) => (
        <Box
          key={field.name}
          sx={{
            minWidth: field.fullWidth ? '100%' : direction === 'row' ? 200 : 'auto',
            flex: field.fullWidth ? '1 1 100%' : direction === 'row' ? '0 0 auto' : '1',
          }}
        >
          <FilterField
            field={field}
            value={values[field.name]}
            onChange={onChange}
            error={errors[field.name]}
          />
        </Box>
      ))}
    </Box>
  );
};