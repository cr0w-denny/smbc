/**
 * Core filter types - framework-agnostic UI primitives
 */

export interface FilterFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "search"
    | "select"
    | "number"
    | "boolean"
    | "checkbox"
    | "hidden"
    | "date"
    | "daterange"
    | "datetime";
  placeholder?: string;
  options?: Array<{ label: string; value: any }> | string[];
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  minWidth?: number | string;
  // Simple validation properties
  min?: number;
  max?: number;
  // Date-specific properties
  minDate?: Date | string;
  maxDate?: Date | string;
  dateFormat?: string;
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
  /** Array of field configurations */
  fields: FilterFieldConfig[];
  /** Initial values for the filters */
  initialValues?: FilterValues;
  /** Title for the filter section */
  title?: string;
  /** Show/hide the filter component */
  visible?: boolean;
  /** Show filters in an expanded/collapsed state */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Show clear filters button */
  showClearButton?: boolean;
  /** Show filter count badge */
  showFilterCount?: boolean;
  /** Debounce delay for filter changes (ms) */
  debounceMs?: number;
}

export interface FilterProps {
  /** Filter specification */
  spec: FilterSpec;
  /** Called when filter values change */
  onFiltersChange: (filters: FilterValues) => void;
  /** Current filter values (for controlled mode) */
  values?: FilterValues;
  /** Additional styling */
  sx?: any;
}