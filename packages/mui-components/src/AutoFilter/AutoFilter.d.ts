/**
 * AutoFilter - Main component for auto-generating filter UIs from OpenAPI specs
 */
import { FilterFieldConfig, FilterValues, AutoFilterConfig } from './types';
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
export declare function AutoFilterFromOperation<TOperation = any>({ operationType, onFiltersChange, values: controlledValues, config, visible, collapsible, defaultCollapsed, title, showClearButton, showFilterCount, debounceMs, sx, }: AutoFilterFromOperationProps<TOperation>): import("react/jsx-runtime").JSX.Element;
/**
 * AutoFilter component using manual field definitions
 */
export declare function AutoFilterFromFields({ fields: fieldConfigs, onFiltersChange, values: controlledValues, config, visible, collapsible, defaultCollapsed, title, showClearButton, showFilterCount, debounceMs, sx, }: AutoFilterFromFieldsProps): import("react/jsx-runtime").JSX.Element;
export declare const AutoFilter: {
    fromOperation: typeof AutoFilterFromOperation;
    fromFields: typeof AutoFilterFromFields;
};
export default AutoFilter;
