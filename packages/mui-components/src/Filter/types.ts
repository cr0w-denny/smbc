/**
 * MUI-specific filter types that extend core types
 */

import type { FilterFieldConfig, FilterValues, FilterSpec, FilterProps as CoreFilterProps } from "@smbc/ui-core";
import type { SxProps, Theme } from "@mui/material";

// Re-export core types
export type { FilterFieldConfig, FilterValues, FilterSpec };

// Extend FilterProps with MUI-specific properties
export interface FilterProps extends CoreFilterProps {
  /** Filter specification */
  spec: FilterSpec;
  /** Additional MUI styling */
  sx?: SxProps<Theme>;
}
