/**
 * Employee Directory Configuration System
 */

import { useMemo } from "react";
import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import type { components } from "@smbc/employee-directory-api/types";

import { useApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createColumnsConfig } from "./columns";
import { createFiltersConfig } from "./filters";
import { createActionsConfig } from "./actions";
import { useBulkActionsConfig } from "./bulkActions";
import { createGlobalActionsConfig } from "./globalActions";
import { createFormsConfig } from "./forms";

type Employee = components["schemas"]["Employee"];

export interface EmployeeDirectoryConfigOptions {
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

/**
 * Create Employee Directory configuration
 */
export function useAppletConfig({
  permissions,
}: EmployeeDirectoryConfigOptions): MuiDataViewAppletConfig<Employee> {
  const apiConfig = useApiConfig();
  const bulkActions = useBulkActionsConfig({
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  });
  
  return useMemo(() => ({
    // API configuration
    api: apiConfig,

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns: createColumnsConfig(),

    // Filters
    filters: createFiltersConfig(),

    // Actions
    actions: {
      row: createActionsConfig({
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
      }),
      bulk: bulkActions,
      global: createGlobalActionsConfig({
        canCreate: permissions.canCreate,
      }),
    },

    // Forms
    forms: createFormsConfig({
      canCreate: permissions.canCreate,
      canEdit: permissions.canEdit,
    }),

    // Pagination
    pagination: {
      enabled: true,
      defaultPageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
    },

    // Activity tracking
    activity: {
      enabled: true,
      entityType: "employee",
      labelGenerator: (employee: Employee) => employee.name,
      urlGenerator: (employee: Employee) => `#/employees/${employee.id}`,
    },
  }), [apiConfig, bulkActions, permissions]);
}
