/**
 * Core filter types used across the application
 */

export interface FilterFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'search' | 'select' | 'number' | 'boolean' | 'checkbox' | 'hidden';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  // Simple validation properties
  min?: number;
  max?: number;
  // Business logic properties (used by AutoFilter features)
  debounceMs?: number;
  /** Exclude this field from the active filter count */
  excludeFromCount?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FilterValues {
  [key: string]: any;
}

export interface FilterSpec {
  fields: FilterFieldConfig[];
  initialValues: FilterValues;
}