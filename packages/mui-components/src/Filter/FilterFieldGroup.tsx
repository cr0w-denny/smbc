/**
 * Pure UI component for groups of filter fields - no business logic or state
 */

import React from 'react';
import { Box } from '@mui/material';
import type { FilterFieldConfig, FilterValues } from './types';
import { FilterField } from './FilterField';

export interface FilterFieldGroupProps {
  fields: FilterFieldConfig[];
  values: FilterValues;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  direction?: 'row' | 'column';
  spacing?: number;
  wrap?: boolean;
}

export const FilterFieldGroup: React.FC<FilterFieldGroupProps> = ({
  fields,
  values,
  onChange,
  errors = {},
  direction = 'row',
  spacing = 2,
  wrap = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: spacing,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      }}
    >
      {fields.map((field) => (
        <Box
          key={field.name}
          sx={{
            minWidth: direction === 'row' ? 200 : 'auto',
            flex: field.fullWidth ? '1 1 auto' : '0 0 auto',
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