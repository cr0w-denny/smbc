/**
 * Employee Directory Configuration System
 */

import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import type { components } from "@smbc/employee-directory-api/generated/types";

import { createApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createColumnsConfig } from "./columns";
import { createFiltersConfig } from "./filters";
import { createActionsConfig } from "./actions";
import { createBulkActionsConfig } from "./bulkActions";
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
export function createAppletConfig({
  permissions,
}: EmployeeDirectoryConfigOptions): MuiDataViewAppletConfig<Employee> {
  const rowActions = createActionsConfig({
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  });
  const bulkActions = createBulkActionsConfig({
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  });
  const globalActions = createGlobalActionsConfig({
    canCreate: permissions.canCreate,
  });

  return {
    // API configuration
    api: createApiConfig(),

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns: createColumnsConfig(),

    // Filters
    filters: createFiltersConfig(),

    // Actions
    actions: {
      row: rowActions,
      bulk: bulkActions,
      global: globalActions,
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
  };
}
