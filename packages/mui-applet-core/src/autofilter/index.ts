/**
 * AutoFilter utilities for transforming OpenAPI schemas into filter specifications
 */

import * as React from 'react';
import type { FilterFieldConfig, FilterValues, FilterSpec } from './types';

// Re-export types
export type { FilterFieldConfig, FilterValues, FilterSpec } from './types';

// Re-export operation type helpers
export {
  createOperationSchema,
  commonOperationSchemas,
  smbcOperationSchemas,
  extractFieldsFromOpenAPIOperation,
} from './operationTypeHelpers';

/**
 * Transform an OpenAPI operation type into a filter specification
 * 
 * @example
 * ```tsx
 * const operationType = { parameters: { search: { type: 'string' } } };
 * const filterSpec = createFilterSpec(operationType);
 * ```
 */
export function createFilterSpec(operationType: any, config?: {
  excludeFields?: string[];
  includeFields?: string[];
  fieldOverrides?: Record<string, Partial<FilterFieldConfig>>;
}): FilterSpec {
  const fields: FilterFieldConfig[] = [];
  const initialValues: FilterValues = {};

  if (!operationType?.parameters) {
    return { fields, initialValues };
  }

  // Extract fields from parameters
  Object.entries(operationType.parameters).forEach(([name, param]: [string, any]) => {
    // Skip if excluded
    if (config?.excludeFields?.includes(name)) return;
    
    // Skip if includeFields is set and this field is not included
    if (config?.includeFields && !config.includeFields.includes(name)) return;

    // Map OpenAPI type to filter field type
    let fieldType: FilterFieldConfig['type'] = 'text';
    if (param.type === 'boolean') fieldType = 'boolean';
    else if (param.type === 'number' || param.type === 'integer') fieldType = 'number';
    else if (param.enum) fieldType = 'select';
    else if (name.toLowerCase().includes('search')) fieldType = 'search';

    const field: FilterFieldConfig = {
      name,
      label: param.description || formatFieldName(name),
      type: fieldType,
      required: param.required || false,
      placeholder: param.description || `Enter ${formatFieldName(name)}...`,
      defaultValue: param.default,
      ...(param.enum && {
        options: param.enum.map((value: any) => ({
          value,
          label: String(value),
        })),
      }),
      ...(param.minimum && { min: param.minimum }),
      ...(param.maximum && { max: param.maximum }),
      // Apply any field overrides
      ...config?.fieldOverrides?.[name],
    };

    fields.push(field);

    // Set initial value if default is provided
    if (param.default !== undefined) {
      initialValues[name] = param.default;
    }
  });

  return { fields, initialValues };
}

/**
 * React hook for using AutoFilter with an operation type
 */
export function useAutoFilter(operationType: any, config?: Parameters<typeof createFilterSpec>[1]) {
  return React.useMemo(
    () => createFilterSpec(operationType, config),
    [operationType, config]
  );
}

/**
 * Higher-level component that combines Filter with auto-generation
 * 
 * @example
 * ```tsx
 * import { Filter } from '@smbc/mui-components';
 * import { createFilterSpec } from '@smbc/mui-applet-core';
 * 
 * function MyComponent() {
 *   const filterSpec = createFilterSpec(myOperationType);
 *   return <Filter spec={filterSpec} onFiltersChange={handleChange} />;
 * }
 * ```
 */
export const AutoFilter = {
  /**
   * Create a filter from an operation type
   */
  fromOperation: (props: {
    operationType: any;
    onFiltersChange: (filters: FilterValues) => void;
    config?: Parameters<typeof createFilterSpec>[1];
  }) => {
    const { operationType, onFiltersChange, config } = props;
    const filterSpec = createFilterSpec(operationType, config);
    
    // This returns the spec that should be passed to the Filter component
    // The actual component rendering happens in the app
    return { spec: filterSpec, onFiltersChange };
  },
};

// Utility function to format field names
function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}