/**
 * Pure UI component for individual filter fields - no business logic or state
 */

import React from "react";
import {
  MenuItem,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Box,
  TextField,
} from "@mui/material";
import { CustomSelect } from "../CustomSelect";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { SearchInput } from "../SearchInput";
import type { FilterFieldConfig } from "./types";
import { parseDate, formatDate } from "./utils/dateUtils";

/**
 * Normalize options to ensure they are in { label, value } format
 */
function normalizeOptions(options?: FilterFieldConfig["options"]) {
  if (!options) return [];

  // If it's already an array of objects, return as-is
  if (
    options.length > 0 &&
    typeof options[0] === "object" &&
    "label" in options[0]
  ) {
    return options as Array<{ label: string; value: any }>;
  }

  // If it's an array of strings, convert to { label, value } objects
  return (options as string[]).map((option) => ({
    label: option,
    value: option,
  }));
}

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
        <Box sx={{ minWidth: field.minWidth }}>
          <SearchInput
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder || field.label}
            disabled={field.disabled}
            size={field.size}
            fullWidth={field.fullWidth}
            debounceMs={disableDebounce ? 0 : 300}
            textFieldProps={{ sx: { minWidth: field.minWidth } }}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      );

    case "select": {
      const normalizedOptions = normalizeOptions(field.options);
      const isMultiple = field.multiple;

      return (
        <Box sx={{ minWidth: field.minWidth }}>
          <CustomSelect
            label={field.label}
            labelMode={field.labelMode}
            value={isMultiple ? (value || []) : (value === undefined ? "" : value)}
            onChange={(e) => {
              const newValue = e.target.value;
              handleChange(newValue);
            }}
            size={field.size || "small"}
            disabled={field.disabled}
            error={!!error}
            multiple={isMultiple}
            displayEmpty
            renderValue={(selected) => {
              if (isMultiple) {
                const selectedArray = Array.isArray(selected) ? selected : [];
                if (selectedArray.length === 0) {
                  return field.placeholder || "None selected";
                }
                if (selectedArray.length === 1) {
                  const option = normalizedOptions.find(opt => opt.value === selectedArray[0]);
                  return option?.label || String(selectedArray[0]);
                }
                return `${selectedArray.length} selected...`;
              } else {
                // Handle undefined/null as the first option (usually "All")
                if (
                  selected === "" ||
                  selected === undefined ||
                  selected === null
                ) {
                  const firstOption = normalizedOptions[0];
                  return firstOption?.label || "All";
                }
                const option = normalizedOptions.find(
                  (opt) => opt.value === selected,
                );
                return option?.label || String(selected);
              }
            }}
            formControlProps={{
              sx: { minWidth: field.minWidth || 120 },
              fullWidth: field.fullWidth,
            }}
          >
            {normalizedOptions.map((option) => (
              <MenuItem
                key={option.value ?? ""}
                value={option.value ?? ""}
                sx={isMultiple ? { display: 'flex', alignItems: 'center' } : {}}
              >
                {isMultiple && (
                  <Checkbox
                    checked={
                      Array.isArray(value) ? value.includes(option.value) : false
                    }
                    size="small"
                    sx={{ mr: 1, p: 0 }}
                  />
                )}
                {option.label}
              </MenuItem>
            ))}
          </CustomSelect>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      );
    }

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
          slotProps={{
            htmlInput: {
              min: field.min,
              max: field.max,
            },
          }}
          helperText={error}
          sx={{ minWidth: field.minWidth }}
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
        <Box sx={{ minWidth: field.minWidth || 170, width: field.minWidth || 170 }}>
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
                fullWidth: false,
                error: !!error,
                helperText: error,
              },
            }}
          />
        </Box>
      );

    case "datetime":
      return (
        <Box sx={{ minWidth: field.minWidth || 170, width: field.minWidth || 170 }}>
          <DateTimePicker
            label={field.label}
            value={parseDate(value, field.dateFormat || "yyyy-MM-dd HH:mm:ss")}
            onChange={(date: Date | null) => {
              const formatted = formatDate(
                date,
                field.dateFormat || "yyyy-MM-dd HH:mm:ss",
              );
              handleChange(formatted);
            }}
            minDateTime={
              parseDate(
                field.minDate,
                field.dateFormat || "yyyy-MM-dd HH:mm:ss",
              ) || undefined
            }
            maxDateTime={
              parseDate(
                field.maxDate,
                field.dateFormat || "yyyy-MM-dd HH:mm:ss",
              ) || undefined
            }
            disabled={field.disabled}
            slotProps={{
              textField: {
                size: field.size || "small",
                fullWidth: false,
                error: !!error,
                helperText: error,
              },
            }}
          />
        </Box>
      );

    case "daterange":
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: field.minWidth }}>
          <DatePicker
            label={`${field.label} From`}
            value={parseDate(value?.from, field.dateFormat)}
            onChange={(date: Date | null) => {
              const from = formatDate(date, field.dateFormat);
              handleChange({
                ...value,
                from,
              });
            }}
            minDate={parseDate(field.minDate, field.dateFormat) || undefined}
            maxDate={
              parseDate(value?.to, field.dateFormat) ||
              parseDate(field.maxDate, field.dateFormat) ||
              undefined
            }
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
                to,
              });
            }}
            minDate={
              parseDate(value?.from, field.dateFormat) ||
              parseDate(field.minDate, field.dateFormat) ||
              undefined
            }
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
          sx={{ minWidth: field.minWidth }}
        />
      );
  }
};
