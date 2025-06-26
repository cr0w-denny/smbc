/**
 * Hook for auto-generating filter configurations from OpenAPI specs or operation types
 */
import { useMemo } from 'react';
import { extractFromOperationType, createInitialValues, validateFilterValues, generateLabel, } from './utils';
/**
 * Extract filter configuration from TypeScript operation types
 * This is the primary way to use AutoFilter with generated openapi-typescript types
 */
export function useAutoFilterFromOperation(operationType, config = {}) {
    return useMemo(() => {
        let fields = extractFromOperationType(operationType);
        // Apply include/exclude filters
        if (config.includeFields) {
            fields = fields.filter(field => config.includeFields.includes(field.name));
        }
        if (config.excludeFields) {
            fields = fields.filter(field => !config.excludeFields.includes(field.name));
        }
        // Hide pagination/sort fields if requested
        if (config.hidePagination) {
            fields = fields.filter(field => !['page', 'pageSize', 'limit', 'offset'].includes(field.name.toLowerCase()));
        }
        if (config.hideSort) {
            fields = fields.filter(field => !field.name.toLowerCase().includes('sort'));
        }
        // Apply field overrides
        if (config.fieldOverrides) {
            fields = fields.map(field => {
                const override = config.fieldOverrides[field.name];
                return override ? { ...field, ...override } : field;
            });
        }
        // Apply layout configurations
        if (config.layout) {
            fields = fields.map(field => ({
                ...field,
                fullWidth: config.layout?.direction === 'column' ? true : field.fullWidth,
                size: field.size || 'medium',
            }));
        }
        const initialValues = createInitialValues(fields);
        const errors = validateFilterValues(initialValues, fields);
        return {
            fields,
            initialValues,
            errors,
        };
    }, [operationType, config]);
}
/**
 * Extract filter configuration from manual field definitions
 * Useful when you want to define filters manually without OpenAPI
 */
export function useAutoFilterFromFields(fieldConfigs, config = {}) {
    return useMemo(() => {
        let fields = [...fieldConfigs];
        // Apply include/exclude filters
        if (config.includeFields) {
            fields = fields.filter(field => config.includeFields.includes(field.name));
        }
        if (config.excludeFields) {
            fields = fields.filter(field => !config.excludeFields.includes(field.name));
        }
        // Apply field overrides
        if (config.fieldOverrides) {
            fields = fields.map(field => {
                const override = config.fieldOverrides[field.name];
                return override ? { ...field, ...override } : field;
            });
        }
        const initialValues = createInitialValues(fields);
        const errors = validateFilterValues(initialValues, fields);
        return {
            fields,
            initialValues,
            errors,
        };
    }, [fieldConfigs, config]);
}
/**
 * Quick helper for creating manual field configurations
 */
export function createFilterField(name, type, overrides = {}) {
    return {
        name,
        label: generateLabel(name),
        type,
        required: false,
        fullWidth: type === 'search',
        size: 'medium',
        ...overrides,
    };
}
/**
 * Common field presets for frequently used filters
 */
export const filterFieldPresets = {
    search: (name = 'search') => createFilterField(name, 'search', {
        placeholder: 'Search...',
        debounceMs: 300,
        fullWidth: true,
    }),
    pageSize: (name = 'pageSize') => createFilterField(name, 'select', {
        label: 'Items per page',
        defaultValue: 10,
        options: [
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
        ],
    }),
    sortBy: (name = 'sortBy', options = []) => createFilterField(name, 'select', {
        label: 'Sort by',
        options,
    }),
    sortOrder: (name = 'sortOrder') => createFilterField(name, 'select', {
        label: 'Sort order',
        defaultValue: 'asc',
        options: [
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
        ],
    }),
    dateRange: (name) => createFilterField(name, 'text', {
        placeholder: 'YYYY-MM-DD',
        // TODO: Could be enhanced with a date picker component
    }),
    category: (name = 'category', options = []) => createFilterField(name, 'select', {
        label: 'Category',
        options,
    }),
    status: (name = 'status', options = []) => createFilterField(name, 'select', {
        label: 'Status',
        options,
    }),
};
