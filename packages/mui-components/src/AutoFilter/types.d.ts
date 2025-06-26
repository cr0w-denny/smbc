/**
 * Types for the AutoFilter component system
 */
export interface OpenAPIParameter {
    name: string;
    in: 'query' | 'path' | 'header';
    required?: boolean;
    schema: {
        type: 'string' | 'integer' | 'number' | 'boolean' | 'array';
        format?: string;
        enum?: string[];
        default?: any;
        minimum?: number;
        maximum?: number;
        pattern?: string;
        description?: string;
    };
    description?: string;
}
export interface FilterFieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'search' | 'hidden';
    required?: boolean;
    defaultValue?: any;
    placeholder?: string;
    options?: Array<{
        value: string | number;
        label: string;
    }>;
    min?: number;
    max?: number;
    disabled?: boolean;
    hidden?: boolean;
    debounceMs?: number;
    fullWidth?: boolean;
    size?: 'small' | 'medium';
}
export interface AutoFilterConfig {
    /** Fields to include in the filter (defaults to all query parameters) */
    includeFields?: string[];
    /** Fields to exclude from the filter */
    excludeFields?: string[];
    /** Custom field configurations to override auto-generated ones */
    fieldOverrides?: Record<string, Partial<FilterFieldConfig>>;
    /** Layout configuration */
    layout?: {
        direction?: 'row' | 'column';
        spacing?: number;
        wrap?: boolean;
        maxFieldsPerRow?: number;
    };
    /** Show/hide common fields automatically */
    hidePagination?: boolean;
    hideSort?: boolean;
}
export type FilterValues = Record<string, any>;
export interface UseAutoFilterParams {
    fields: FilterFieldConfig[];
    initialValues: FilterValues;
    errors: Record<string, string>;
}
