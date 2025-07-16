/**
 * Pure UI component for individual filter fields - no business logic or state
 */

import React from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { SearchInput } from "../SearchInput";
import type { FilterFieldConfig } from "./types";
import { parseDate, formatDate } from "./utils/dateUtils";

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
  if (field.type === "hidden" || field.hidden) {
    return null;
  }

  const commonProps = {
    disabled: field.disabled,
    size: field.size || "small",
    fullWidth: field.fullWidth,
    error: !!error,
  };

  switch (field.type) {
    case "search":
      return (
        <Box>
          <SearchInput
            value={value || ""}
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

    case "select":
      return (
        <FormControl {...commonProps} sx={{ minWidth: 120 }}>
          <InputLabel shrink={true}>{field.label}</InputLabel>
          <Select
            value={value === undefined ? "" : value}
            onChange={(e) => {
              const newValue = e.target.value;
              handleChange(newValue);
            }}
            label={field.label}
            displayEmpty
            notched
            renderValue={(selected) => {
              // Handle undefined/null as the first option (usually "All")
              if (selected === "" || selected === undefined || selected === null) {
                const firstOption = field.options?.[0];
                return firstOption?.label || "All";
              }
              const option = field.options?.find(
                (opt) => opt.value === selected,
              );
              return option?.label || selected;
            }}
          >
            {field.options?.map((option) => (
              <MenuItem 
                key={option.value ?? ""} 
                value={option.value ?? ""}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
      );

    case "number":
      return (
        <TextField
          {...commonProps}
          type="number"
          label={field.label}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) =>
            handleChange(e.target.value ? Number(e.target.value) : null)
          }
          inputProps={{
            min: field.min,
            max: field.max,
          }}
          helperText={error}
        />
      );

    case "boolean":
    case "checkbox":
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

    case "date":
      return (
        <Box>
          <DatePicker
            label={field.label}
            value={parseDate(value, field.dateFormat)}
            onChange={(date: Date | null) => {
              const formatted = formatDate(date, field.dateFormat);
              handleChange(formatted);
            }}
            minDate={parseDate(field.minDate, field.dateFormat) || undefined}
            maxDate={parseDate(field.maxDate, field.dateFormat) || undefined}
            disabled={field.disabled}
            slotProps={{
              textField: {
                size: field.size || "small",
                fullWidth: field.fullWidth,
                error: !!error,
                helperText: error,
              },
            }}
          />
        </Box>
      );

    case "datetime":
      return (
        <Box>
          <DateTimePicker
            label={field.label}
            value={parseDate(value, field.dateFormat || 'yyyy-MM-dd HH:mm:ss')}
            onChange={(date: Date | null) => {
              const formatted = formatDate(date, field.dateFormat || 'yyyy-MM-dd HH:mm:ss');
              handleChange(formatted);
            }}
            minDateTime={parseDate(field.minDate, field.dateFormat || 'yyyy-MM-dd HH:mm:ss') || undefined}
            maxDateTime={parseDate(field.maxDate, field.dateFormat || 'yyyy-MM-dd HH:mm:ss') || undefined}
            disabled={field.disabled}
            slotProps={{
              textField: {
                size: field.size || "small",
                fullWidth: field.fullWidth,
                error: !!error,
                helperText: error,
              },
            }}
          />
        </Box>
      );

    case "daterange":
      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <DatePicker
            label={`${field.label} From`}
            value={parseDate(value?.from, field.dateFormat)}
            onChange={(date: Date | null) => {
              const from = formatDate(date, field.dateFormat);
              handleChange({ 
                ...value, 
                from 
              });
            }}
            minDate={parseDate(field.minDate, field.dateFormat) || undefined}
            maxDate={parseDate(value?.to, field.dateFormat) || parseDate(field.maxDate, field.dateFormat) || undefined}
            disabled={field.disabled}
            slotProps={{
              textField: {
                size: field.size || "small",
                error: !!error,
              },
            }}
          />
          <DatePicker
            label={`${field.label} To`}
            value={parseDate(value?.to, field.dateFormat)}
            onChange={(date: Date | null) => {
              const to = formatDate(date, field.dateFormat);
              handleChange({ 
                ...value, 
                to 
              });
            }}
            minDate={parseDate(value?.from, field.dateFormat) || parseDate(field.minDate, field.dateFormat) || undefined}
            maxDate={parseDate(field.maxDate, field.dateFormat) || undefined}
            disabled={field.disabled}
            slotProps={{
              textField: {
                size: field.size || "small",
                error: !!error,
              },
            }}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      );

    case "text":
    default:
      return (
        <TextField
          {...commonProps}
          label={field.label}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          helperText={error}
        />
      );
  }
};
