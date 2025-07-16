/**
 * UserManager Configuration System
 *
 * This folder contains a modular configuration system for the UserManager component.
 * Each file handles a specific aspect of the data view configuration:
 *
 * - api.ts: Configures API endpoints, HTTP client, response parsing, and query parameters
 * - schema.ts: Defines the data model structure, field types, validation rules, and display names
 * - columns.tsx: Configures table columns, their properties, custom renderers, and sorting
 * - filters.ts: Sets up search and filter fields, their types, and filter transformation logic
 * - actions.ts: Defines row-level actions (edit, delete) with icons and permissions
 * - bulkActions.ts: Configures bulk operations that can be performed on multiple selected rows
 * - globalActions.ts: Sets up global actions like "Create User" that aren't row-specific
 * - forms.ts: Configures create and edit forms, their fields, and validation
 * - index.ts: Main configuration file that combines all configs into a single MuiDataViewAppletConfig
 *
 */

import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import type { components } from "@smbc/user-management-api/generated/types";

import { createApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createColumnsConfig, getActiveColumns } from "./columns";
import { createFiltersConfig, transformFilters } from "./filters";
import { createActionsConfig } from "./actions";
import { createBulkActionsConfig } from "./bulkActions";
import { createGlobalActionsConfig } from "./globalActions";
import { createFormsConfig } from "./forms";

type User = components["schemas"]["User"];

export interface UserManagerConfigOptions {
  userType: "all" | "admins" | "non-admins";
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  handlers?: {
    onViewUser?: (user: User) => void;
  };
}

/**
 * Create UserManager configuration
 */
export function createUserManagerConfig({
  userType,
  permissions,
  handlers,
}: UserManagerConfigOptions): MuiDataViewAppletConfig<User> {
  const columns = createColumnsConfig();

  return {
    // API configuration
    api: createApiConfig(userType),

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns,

    // Filters
    filters: createFiltersConfig(),

    // Actions
    actions: {
      row: createActionsConfig(
        {
          canEdit: permissions.canEdit,
          canDelete: permissions.canDelete,
        },
        handlers,
      ),
      bulk: createBulkActionsConfig({
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
      }),
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
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50],
    },

    // Renderer-specific configuration
    rendererConfig: {
      transformFilters,
      getActiveColumns,
    },

    // Activity tracking
    activity: {
      enabled: true,
      entityType: "user",
      labelGenerator: (user: User) => `${user.firstName} ${user.lastName}`,
      urlGenerator: (user: User) => `#/user-management/profile/${user.id}`,
    },
  };
}
