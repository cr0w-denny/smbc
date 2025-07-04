/**
 * Generic Filter component - pure UI with no schema knowledge
 */

import React, { useState, useCallback, useMemo } from "react";
import { FilterContainer } from "./FilterContainer";
import { FilterFieldGroup } from "./FilterFieldGroup";
import type {
  FilterFieldConfig,
  FilterValues,
  FilterSpec,
  FilterProps,
} from "./types";

// Re-export types for convenience
export type { FilterFieldConfig, FilterValues, FilterSpec, FilterProps };

/**
 * Generic Filter component for building filter UIs
 *
 * @example
 * ```tsx
 * const filterSpec = {
 *   fields: [
 *     { name: 'search', type: 'search', label: 'Search' },
 *     { name: 'category', type: 'select', label: 'Category', options: [...] }
 *   ]
 * };
 *
 * <Filter
 *   spec={filterSpec}
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 * ```
 */
export function Filter({
  spec,
  onFiltersChange,
  values: controlledValues,
  sx,
}: FilterProps) {
  const {
    fields = [],
    initialValues = {},
    title = "Filters",
    visible = true,
    collapsible = false,
    defaultCollapsed = false,
    showClearButton = true,
    showFilterCount = true,
    debounceMs = 300,
  } = spec;

  const [internalValues, setInternalValues] = useState<FilterValues>(
    controlledValues || initialValues,
  );

  // For controlled mode, we need separate local values for immediate UI feedback
  const [localValues, setLocalValues] = useState<FilterValues>(
    controlledValues || initialValues,
  );

  const isControlled = controlledValues !== undefined;

  // Sync controlled values to local values when they change externally
  React.useEffect(() => {
    if (isControlled && controlledValues) {
      setLocalValues(controlledValues);
    }
  }, [controlledValues, isControlled]);

  // For display purposes, use local values in controlled mode, internal values in uncontrolled
  const displayValues = isControlled ? localValues : internalValues;

  // Note: We use displayValues for filter count calculation to get immediate UI feedback

  // Debounced filter change handler
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      const newDisplayValues = { ...displayValues, [name]: value };

      // Always update local/display values immediately for responsive UI
      if (isControlled) {
        setLocalValues(newDisplayValues);
      } else {
        setInternalValues(newDisplayValues);
      }

      // Debounce the onChange callback
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Clean empty values before calling onChange, but preserve empty strings for text/search fields
        // so that useHashQueryParams can properly handle them (and remove from URL if they match defaults)
        // ALSO preserve undefined values for "All" selections in select fields
        const cleaned = Object.entries(newDisplayValues).reduce(
          (acc, [key, val]) => {
            const field = fields.find((f) => f.name === key);
            const isTextualField =
              field && ["text", "search", "email"].includes(field.type);
            const isSelectField = field && field.type === "select";


            if (
              val !== null &&
              (val !== "" || isTextualField || (isSelectField && val === undefined))
            ) {
              acc[key] = val;
            }
            return acc;
          },
          {} as FilterValues,
        );

        onFiltersChange(cleaned);
      }, debounceMs);
    },
    [displayValues, fields, isControlled, onFiltersChange, debounceMs],
  );

  const handleClearFilters = useCallback(() => {
    // Build cleared values, setting all fields to their default/empty values
    const clearedValues = fields.reduce((acc, field) => {
      const isTextualField = ["text", "search", "email"].includes(field.type);
      const isSelectField = field.type === "select";
      
      if (isTextualField && field.defaultValue !== undefined) {
        acc[field.name] = field.defaultValue;
      } else if (isTextualField) {
        acc[field.name] = ""; // Default to empty string for text fields
      } else if (isSelectField) {
        // For select fields, use the first option's value (usually empty string for "All")
        const firstOption = field.options?.[0];
        acc[field.name] = firstOption?.value ?? "";
      } else {
        // For other field types, use empty string as default
        acc[field.name] = "";
      }
      return acc;
    }, {} as FilterValues);

    // Clear both local and internal values
    if (isControlled) {
      setLocalValues(clearedValues);
    } else {
      setInternalValues(clearedValues);
    }

    // Clear the debounce timer and immediately call onFiltersChange
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFiltersChange(clearedValues);
  }, [fields, isControlled, onFiltersChange]);

  // Count active filters using the display values for immediate UI feedback
  const activeFilterCount = useMemo(() => {
    return Object.entries(displayValues || {}).filter(([key, value]) => {
      const field = fields.find((f) => f.name === key);
      if (!field || field.type === "hidden" || field.excludeFromCount)
        return false;

      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== field.defaultValue
      );
    }).length;
  }, [displayValues, fields]);

  if (!visible || fields.length === 0) {
    return null;
  }

  const visibleFields = fields.filter((f) => f.type !== "hidden" && !f.hidden);

  return (
    <FilterContainer
      title={title}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      showClearButton={showClearButton}
      showFilterCount={showFilterCount}
      activeFilterCount={activeFilterCount}
      onClearFilters={handleClearFilters}
      sx={sx}
    >
      <FilterFieldGroup
        fields={visibleFields}
        values={displayValues}
        onChange={handleFieldChange}
        spacing={2}
        direction="row"
        wrap={true}
        disableDebounce={true}
      />
    </FilterContainer>
  );
}
