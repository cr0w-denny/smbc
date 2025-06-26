/**
 * Generic Filter component - pure UI with no schema knowledge
 */

import React, { useState, useCallback, useMemo } from 'react';
import { FilterContainer } from './FilterContainer';
import { FilterFieldGroup } from './FilterFieldGroup';
import type { FilterFieldConfig, FilterValues, FilterSpec, FilterProps } from './types';

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
    title = 'Filters',
    visible = true,
    collapsible = false,
    defaultCollapsed = false,
    showClearButton = true,
    showFilterCount = true,
    debounceMs = 300,
  } = spec;

  const [internalValues, setInternalValues] = useState<FilterValues>(
    controlledValues || initialValues
  );

  const isControlled = controlledValues !== undefined;
  const currentValues = isControlled ? controlledValues : internalValues;

  // Debounced filter change handler
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  
  const handleFieldChange = useCallback((name: string, value: any) => {
    const newValues = { ...currentValues, [name]: value };
    
    if (!isControlled) {
      setInternalValues(newValues);
    }

    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      // Clean empty values before calling onChange
      const cleaned = Object.entries(newValues).reduce((acc, [key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          acc[key] = val;
        }
        return acc;
      }, {} as FilterValues);
      
      onFiltersChange(cleaned);
    }, debounceMs);
  }, [currentValues, isControlled, onFiltersChange, debounceMs]);

  const handleClearFilters = useCallback(() => {
    const clearedValues = {};
    
    if (!isControlled) {
      setInternalValues(clearedValues);
    }
    
    onFiltersChange(clearedValues);
  }, [isControlled, onFiltersChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.entries(currentValues).filter(([key, value]) => {
      const field = fields.find(f => f.name === key);
      if (!field || field.type === 'hidden') return false;
      
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== field.defaultValue;
    }).length;
  }, [currentValues, fields]);

  if (!visible || fields.length === 0) {
    return null;
  }

  const visibleFields = fields.filter(f => f.type !== 'hidden' && !f.hidden);
  
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
        values={currentValues}
        onChange={handleFieldChange}
        spacing={2}
        direction="row"
        wrap={true}
      />
    </FilterContainer>
  );
}