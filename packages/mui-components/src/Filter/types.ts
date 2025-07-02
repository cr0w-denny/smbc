/**
 * Core filter types
 */

import type { FilterFieldConfig, FilterValues } from "@smbc/applet-dataview";

export type { FilterFieldConfig, FilterValues };

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
