/**
 * Integration hook for AutoFilter with URL query parameters
 * This provides seamless integration with hash-based navigation
 */

import { useCallback, useMemo } from 'react';
import { FilterValues, FilterFieldConfig, AutoFilterConfig } from './types';
import { useAutoFilterFromOperation, useAutoFilterFromFields } from './useAutoFilter';
import { cleanFilterValues } from './utils';

// Note: This would normally import from @smbc/mui-applet-core
// But since this is a shared component, we'll make it optional
type UseHashQueryParamsHook = <T extends Record<string, any>>(
  defaultValues: T
) => [T, (updates: Partial<T>) => void];

interface UseAutoFilterWithUrlOptions<TDefaults extends FilterValues = FilterValues> {
  /** Default values for the URL parameters */
  defaultValues?: TDefaults;
  /** Hook for managing hash query parameters (from @smbc/mui-applet-core) */
  useHashQueryParams?: UseHashQueryParamsHook;
  /** Configuration for the filter behavior */
  config?: AutoFilterConfig;
  /** Transform values before sending to URL */
  transformToUrl?: (values: FilterValues) => FilterValues;
  /** Transform values when reading from URL */
  transformFromUrl?: (values: FilterValues) => FilterValues;
}

/**
 * Use AutoFilter with URL synchronization from operation types
 */
export function useAutoFilterWithUrlFromOperation<
  TOperation = any,
  TDefaults extends FilterValues = FilterValues
>(
  operationType: TOperation,
  options: UseAutoFilterWithUrlOptions<TDefaults> = {}
) {
  const { fields, initialValues } = useAutoFilterFromOperation(operationType, options.config);
  
  return useAutoFilterWithUrlCore(fields, initialValues, options);
}

/**
 * Use AutoFilter with URL synchronization from manual field definitions
 */
export function useAutoFilterWithUrlFromFields<TDefaults extends FilterValues = FilterValues>(
  fieldConfigs: FilterFieldConfig[],
  options: UseAutoFilterWithUrlOptions<TDefaults> = {}
) {
  const { fields, initialValues } = useAutoFilterFromFields(fieldConfigs, options.config);
  
  return useAutoFilterWithUrlCore(fields, initialValues, options);
}

/**
 * Core implementation for URL-synchronized AutoFilter
 */
function useAutoFilterWithUrlCore<TDefaults extends FilterValues = FilterValues>(
  fields: FilterFieldConfig[],
  initialValues: FilterValues,
  options: UseAutoFilterWithUrlOptions<TDefaults> = {}
) {
  const {
    defaultValues = initialValues,
    useHashQueryParams,
    transformToUrl = (v) => v,
    transformFromUrl = (v) => v,
  } = options;

  // Use hash query params if available
  const urlHook = useHashQueryParams?.(defaultValues);
  const [urlValues, setUrlValues] = urlHook || [undefined, undefined];

  // Determine current values and change handler
  const { currentValues, onValuesChange } = useMemo(() => {
    if (urlHook && urlValues && setUrlValues) {
      // URL-synchronized mode
      const current = transformFromUrl(urlValues);
      const onChange = (newValues: FilterValues) => {
        const cleaned = cleanFilterValues(newValues);
        const transformed = transformToUrl(cleaned);
        setUrlValues(transformed);
      };
      
      return {
        currentValues: current,
        onValuesChange: onChange,
      };
    } else {
      // Standalone mode (no URL sync)
      return {
        currentValues: undefined, // Let AutoFilter manage its own state
        onValuesChange: () => {}, // No-op
      };
    }
  }, [urlValues, setUrlValues, transformToUrl, transformFromUrl, urlHook]);

  // Filter management utilities
  const filterUtils = useMemo(() => ({
    fields,
    initialValues,
    
    // Clear all filters
    clearFilters: () => {
      onValuesChange(initialValues);
    },

    // Set specific filter value
    setFilter: (name: string, value: any) => {
      const newValues = { ...(currentValues || {}), [name]: value };
      onValuesChange(newValues);
    },

    // Set multiple filter values
    setFilters: (values: Partial<FilterValues>) => {
      const newValues = { ...(currentValues || {}), ...values };
      onValuesChange(newValues);
    },

    // Get current filter value
    getFilter: (name: string) => {
      return currentValues?.[name];
    },

    // Check if a filter is active (has non-default value)
    isFilterActive: (name: string) => {
      const field = fields.find(f => f.name === name);
      const value = currentValues?.[name];
      const defaultValue = field?.defaultValue;
      
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== defaultValue;
    },

    // Get count of active filters
    getActiveFilterCount: () => {
      if (!currentValues) return 0;
      
      return Object.entries(currentValues).filter(([key, value]) => {
        const field = fields.find(f => f.name === key);
        if (!field || field.type === 'hidden') return false;
        
        const defaultValue = field.defaultValue;
        return value !== undefined && 
               value !== null && 
               value !== '' && 
               value !== defaultValue;
      }).length;
    },

    // Get cleaned filter values (for API calls)
    getCleanedValues: () => {
      return cleanFilterValues(currentValues || {});
    },
  }), [fields, initialValues, currentValues, onValuesChange]);

  return {
    // Current filter values (for controlled AutoFilter)
    values: currentValues,
    
    // Change handler for AutoFilter
    onFiltersChange: onValuesChange,
    
    // Utility functions
    ...filterUtils,
  };
}

/**
 * Standalone hook for URL filter management (without AutoFilter component)
 * Useful when you want to manage filters manually but still sync with URL
 */
export function useUrlFilters<TDefaults extends FilterValues = FilterValues>(
  defaultValues: TDefaults,
  useHashQueryParams: UseHashQueryParamsHook,
  options: {
    transformToUrl?: (values: FilterValues) => FilterValues;
    transformFromUrl?: (values: FilterValues) => FilterValues;
  } = {}
) {
  const {
    transformToUrl = (v) => v,
    transformFromUrl = (v) => v,
  } = options;

  const [urlValues, setUrlValues] = useHashQueryParams(defaultValues);

  const currentValues = useMemo(() => transformFromUrl(urlValues), [urlValues, transformFromUrl]);

  const setFilters = useCallback((newValues: FilterValues) => {
    const cleaned = cleanFilterValues(newValues);
    const transformed = transformToUrl(cleaned);
    setUrlValues(transformed as Partial<TDefaults>);
  }, [setUrlValues, transformToUrl]);

  const setFilter = useCallback((name: string, value: any) => {
    const newValues = { ...currentValues, [name]: value };
    setFilters(newValues);
  }, [currentValues, setFilters]);

  const clearFilters = useCallback(() => {
    setUrlValues(defaultValues);
  }, [setUrlValues, defaultValues]);

  return {
    values: currentValues,
    setFilters,
    setFilter,
    clearFilters,
    getCleanedValues: () => cleanFilterValues(currentValues),
  };
}