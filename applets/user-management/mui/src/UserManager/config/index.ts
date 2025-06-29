import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import { type components } from "@smbc/user-management-client";

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

    // Permissions
    permissions: undefined, // No longer needed since we removed the permissions re-export

    // Pagination
    pagination: {
      enabled: true,
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50],
    },

    // Additional options
    options: {
      apiParams: createApiConfig(userType).apiParams,
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
