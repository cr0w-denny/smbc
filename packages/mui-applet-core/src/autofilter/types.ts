/**
 * Filter types for AutoFilter system
 */

import type { FilterFieldConfig as BaseFilterFieldConfig, FilterValues as BaseFilterValues } from '@smbc/mui-components';

// Extended version with business logic properties
export interface FilterFieldConfig extends BaseFilterFieldConfig {
  // Business logic properties (used by AutoFilter features)
  debounceMs?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FilterValues extends BaseFilterValues {}

export interface FilterSpec {
  fields: FilterFieldConfig[];
  initialValues: FilterValues;
}
