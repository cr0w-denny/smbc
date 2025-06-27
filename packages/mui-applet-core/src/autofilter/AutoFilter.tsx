/**
 * AutoFilter - Main component for auto-generating filter UIs from OpenAPI specs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FilterFieldGroup,
  FilterContainer,
  type FilterFieldConfig,
  type FilterValues,
} from '@smbc/mui-components';
import { useAutoFilterFromOperation, useAutoFilterFromFields } from './useAutoFilter';
import { AutoFilterConfig } from './types';
import { cleanFilterValues, validateFilterValues } from '@smbc/applet-core';

interface AutoFilterProps {
  /** Called when filter values change */
  onFiltersChange: (filters: FilterValues) => void;
  /** Current filter values (for controlled mode) */
  values?: FilterValues;
  /** Configuration for the filter behavior and layout */
  config?: AutoFilterConfig;
  /** Show/hide the filter component */
  visible?: boolean;
  /** Show filters in an expanded/collapsed state */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Custom title for the filter section */
  title?: string;
  /** Show clear filters button */
  showClearButton?: boolean;
  /** Show filter count badge */
  showFilterCount?: boolean;
  /** Debounce delay for filter changes (ms) */
  debounceMs?: number;
  /** Additional styling */
  sx?: any;
}

interface AutoFilterFromOperationProps<TOperation = any> extends AutoFilterProps {
  /** TypeScript operation type from openapi-typescript */
  operationType: TOperation;
}

interface AutoFilterFromFieldsProps extends AutoFilterProps {
  /** Manual field configurations */
  fields: FilterFieldConfig[];
}

/**
 * AutoFilter component using operation types (recommended approach)
 */
export function AutoFilterFromOperation<TOperation = any>({
  operationType,
  onFiltersChange,
  values: controlledValues,
  config = {},
  visible = true,
  collapsible = false,
  defaultCollapsed = false,
  title = 'Filters',
  showClearButton = true,
  showFilterCount = true,
  debounceMs = 300,
  sx,
}: AutoFilterFromOperationProps<TOperation>) {
  const { fields, initialValues } = useAutoFilterFromOperation(operationType, config);

  return (
    <AutoFilterCore
      fields={fields}
      initialValues={initialValues}
      onFiltersChange={onFiltersChange}
      values={controlledValues}
      visible={visible}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      title={title}
      showClearButton={showClearButton}
      showFilterCount={showFilterCount}
      debounceMs={debounceMs}
      sx={sx}
    />
  );
}

/**
 * AutoFilter component using manual field definitions
 */
export function AutoFilterFromFields({
  fields: fieldConfigs,
  onFiltersChange,
  values: controlledValues,
  config = {},
  visible = true,
  collapsible = false,
  defaultCollapsed = false,
  title = 'Filters',
  showClearButton = true,
  showFilterCount = true,
  debounceMs = 300,
  sx,
}: AutoFilterFromFieldsProps) {
  const { fields, initialValues } = useAutoFilterFromFields(fieldConfigs, config);

  return (
    <AutoFilterCore
      fields={fields}
      initialValues={initialValues}
      onFiltersChange={onFiltersChange}
      values={controlledValues}
      visible={visible}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      title={title}
      showClearButton={showClearButton}
      showFilterCount={showFilterCount}
      debounceMs={debounceMs}
      sx={sx}
    />
  );
}

/**
 * Core AutoFilter implementation (internal)
 */
interface AutoFilterCoreProps {
  fields: FilterFieldConfig[];
  initialValues: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  values?: FilterValues;
  visible: boolean;
  collapsible: boolean;
  defaultCollapsed: boolean;
  title: string;
  showClearButton: boolean;
  showFilterCount: boolean;
  debounceMs: number;
  sx?: any;
}

function AutoFilterCore({
  fields,
  initialValues,
  onFiltersChange,
  values: controlledValues,
  visible,
  collapsible,
  defaultCollapsed,
  title,
  showClearButton,
  showFilterCount,
  debounceMs,
  sx,
}: AutoFilterCoreProps) {

  const [internalValues, setInternalValues] = useState<FilterValues>(
    controlledValues || initialValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isControlled = controlledValues !== undefined;
  const currentValues = isControlled ? controlledValues : internalValues;

  // Update internal values when controlled values change
  useEffect(() => {
    if (isControlled && controlledValues) {
      setInternalValues(controlledValues);
    }
  }, [controlledValues, isControlled]);

  // Debounced filter change handler
  const debouncedOnFiltersChange = useCallback(
    debounceCallback((filters: FilterValues) => {
      const cleaned = cleanFilterValues(filters);
      onFiltersChange(cleaned);
    }, debounceMs),
    [onFiltersChange, debounceMs]
  );

  const handleFieldChange = useCallback((name: string, value: any) => {
    const newValues = { ...currentValues, [name]: value };
    
    // Validate
    const newErrors = validateFilterValues(newValues, fields);
    setErrors(newErrors);

    // Update state
    if (!isControlled) {
      setInternalValues(newValues);
    }

    // Notify parent (debounced)
    debouncedOnFiltersChange(newValues);
  }, [currentValues, fields, isControlled, debouncedOnFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const clearedValues = { ...initialValues };
    
    if (!isControlled) {
      setInternalValues(clearedValues);
    }
    
    setErrors({});
    onFiltersChange(clearedValues);
  }, [initialValues, isControlled, onFiltersChange]);


  // Count active filters (non-empty, non-default values)
  const activeFilterCount = React.useMemo(() => {
    return Object.entries(currentValues).filter(([key, value]) => {
      const field = fields.find(f => f.name === key);
      if (!field || field.type === 'hidden') return false;
      
      const defaultValue = field.defaultValue;
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== defaultValue;
    }).length;
  }, [currentValues, fields]);

  if (!visible) {
    return null;
  }

  const visibleFields = fields.filter(f => f.type !== 'hidden' && !f.hidden);
  
  if (visibleFields.length === 0) {
    return null;
  }

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
        fields={visibleFields as any}
        values={currentValues}
        onChange={handleFieldChange}
        errors={errors}
        spacing={2}
        direction="row"
        wrap={true}
      />
    </FilterContainer>
  );
}

/**
 * Simple debounce utility
 */
function debounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

// Export the main components
export const AutoFilter = {
  fromOperation: AutoFilterFromOperation,
  fromFields: AutoFilterFromFields,
};

// Default export for backwards compatibility
export default AutoFilter;