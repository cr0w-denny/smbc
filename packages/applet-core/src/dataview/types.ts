import type { PermissionDefinition } from "../permissions";

// Import shared types from react-dataview (base package)
import type {
  DataField,
  DataSchema,
  DataViewApiConfig,
  DataColumn,
  PaginationConfig,
  FormConfig,
  DataViewFilterFieldConfig,
  DataViewFilterSpec,
  DataViewFilterProps,
  DataViewFormProps,
  DataViewPaginationProps,
  DataViewTableProps,
  DataView,
  DataViewCreateButtonProps,
} from "@smbc/react-dataview";

// Re-export shared types for convenience
export type {
  DataField,
  DataSchema,
  DataViewApiConfig,
  DataColumn,
  PaginationConfig,
  FormConfig,
  DataViewFilterFieldConfig,
  DataViewFilterSpec,
  DataViewFilterProps,
  DataViewFormProps,
  DataViewPaginationProps,
  DataViewTableProps,
  DataView,
  DataViewCreateButtonProps,
};

// Re-export action types from react-dataview
export type { RowAction, BulkAction, GlobalAction } from "@smbc/react-dataview";

// SMBC-specific permission configuration (extends base types)
export interface DataViewPermissions {
  view?: PermissionDefinition;
  create?: PermissionDefinition;
  edit?: PermissionDefinition;
  delete?: PermissionDefinition;
}

// Re-export from react-dataview for convenience
export type { DataViewConfig, DataViewResult } from "@smbc/react-dataview";
