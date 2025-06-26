/**
 * Hook for auto-generating filter configurations from OpenAPI specs or operation types
 */
import { FilterFieldConfig, AutoFilterConfig, UseAutoFilterParams } from './types';
/**
 * Extract filter configuration from TypeScript operation types
 * This is the primary way to use AutoFilter with generated openapi-typescript types
 */
export declare function useAutoFilterFromOperation<TOperation = any>(operationType: TOperation, config?: AutoFilterConfig): UseAutoFilterParams;
/**
 * Extract filter configuration from manual field definitions
 * Useful when you want to define filters manually without OpenAPI
 */
export declare function useAutoFilterFromFields(fieldConfigs: FilterFieldConfig[], config?: AutoFilterConfig): UseAutoFilterParams;
/**
 * Quick helper for creating manual field configurations
 */
export declare function createFilterField(name: string, type: FilterFieldConfig['type'], overrides?: Partial<FilterFieldConfig>): FilterFieldConfig;
/**
 * Common field presets for frequently used filters
 */
export declare const filterFieldPresets: {
    search: (name?: string) => FilterFieldConfig;
    pageSize: (name?: string) => FilterFieldConfig;
    sortBy: (name?: string, options?: Array<{
        value: string;
        label: string;
    }>) => FilterFieldConfig;
    sortOrder: (name?: string) => FilterFieldConfig;
    dateRange: (name: string) => FilterFieldConfig;
    category: (name?: string, options?: Array<{
        value: string;
        label: string;
    }>) => FilterFieldConfig;
    status: (name?: string, options?: Array<{
        value: string;
        label: string;
    }>) => FilterFieldConfig;
};
