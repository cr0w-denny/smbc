/**
 * Integration hook for AutoFilter with URL query parameters
 * This provides seamless integration with hash-based navigation
 */
import { FilterValues, FilterFieldConfig, AutoFilterConfig } from './types';
type UseHashQueryParamsHook = <T extends Record<string, any>>(defaultValues: T) => [T, (updates: Partial<T>) => void];
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
export declare function useAutoFilterWithUrlFromOperation<TOperation = any, TDefaults extends FilterValues = FilterValues>(operationType: TOperation, options?: UseAutoFilterWithUrlOptions<TDefaults>): {
    fields: FilterFieldConfig[];
    initialValues: FilterValues;
    clearFilters: () => void;
    setFilter: (name: string, value: any) => void;
    setFilters: (values: Partial<FilterValues>) => void;
    getFilter: (name: string) => any;
    isFilterActive: (name: string) => boolean;
    getActiveFilterCount: () => number;
    getCleanedValues: () => FilterValues;
    values: FilterValues | undefined;
    onFiltersChange: ((newValues: FilterValues) => void) | (() => void);
};
/**
 * Use AutoFilter with URL synchronization from manual field definitions
 */
export declare function useAutoFilterWithUrlFromFields<TDefaults extends FilterValues = FilterValues>(fieldConfigs: FilterFieldConfig[], options?: UseAutoFilterWithUrlOptions<TDefaults>): {
    fields: FilterFieldConfig[];
    initialValues: FilterValues;
    clearFilters: () => void;
    setFilter: (name: string, value: any) => void;
    setFilters: (values: Partial<FilterValues>) => void;
    getFilter: (name: string) => any;
    isFilterActive: (name: string) => boolean;
    getActiveFilterCount: () => number;
    getCleanedValues: () => FilterValues;
    values: FilterValues | undefined;
    onFiltersChange: ((newValues: FilterValues) => void) | (() => void);
};
/**
 * Standalone hook for URL filter management (without AutoFilter component)
 * Useful when you want to manage filters manually but still sync with URL
 */
export declare function useUrlFilters<TDefaults extends FilterValues = FilterValues>(defaultValues: TDefaults, useHashQueryParams: UseHashQueryParamsHook, options?: {
    transformToUrl?: (values: FilterValues) => FilterValues;
    transformFromUrl?: (values: FilterValues) => FilterValues;
}): {
    values: FilterValues;
    setFilters: (newValues: FilterValues) => void;
    setFilter: (name: string, value: any) => void;
    clearFilters: () => void;
    getCleanedValues: () => FilterValues;
};
export {};
