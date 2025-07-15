import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import { createUserUsageApiConfig, createUIUsageApiConfig, createExceptionsApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createUserUsageColumns, createComponentUsageColumns, createExceptionColumns } from "./columns";
import { createUserUsageFilters, createUIUsageFilters, createExceptionsFilters } from "./filters";

export interface UsageStatsConfigOptions {
  permissions: {
    canView: boolean;
    canExport: boolean;
  };
}

/**
 * Create User Usage configuration with drill-down support
 */
export function createUserUsageConfig(): MuiDataViewAppletConfig<any> {
  return {
    // API configuration
    api: createUserUsageApiConfig(),

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns: createUserUsageColumns(),

    // Filters
    filters: createUserUsageFilters(),

    // Actions - read-only, so no actions needed
    actions: {
      row: [],
      bulk: [],
      global: [],
    },

    // Forms - read-only, so no forms needed
    forms: {
      create: null,
      edit: null,
    },

    // No pagination - using drill-down instead
    pagination: {
      enabled: false,
    },

    // Activity tracking
    activity: {
      enabled: false, // Read-only data doesn't need activity tracking
    },

    // Expandable rows for drill-down
    expandableRows: {
      enabled: true,
      renderDetail: (row: any) => {
        // This will render a nested table for UI usage details
        return null; // TODO: Implement detail component
      },
    },
  };
}

/**
 * Create UI Usage configuration
 */
export function createUIUsageConfig(): MuiDataViewAppletConfig<any> {
  return {
    // API configuration
    api: createUIUsageApiConfig(),

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns: createComponentUsageColumns(),

    // Filters
    filters: createUIUsageFilters(),

    // Actions - read-only, so no actions needed
    actions: {
      row: [],
      bulk: [],
      global: [],
    },

    // Forms - read-only, so no forms needed
    forms: {
      create: null,
      edit: null,
    },

    // No pagination - using drill-down instead
    pagination: {
      enabled: false,
    },

    // Activity tracking
    activity: {
      enabled: false, // Read-only data doesn't need activity tracking
    },
  };
}

/**
 * Create Exceptions configuration
 */
export function createExceptionsConfig(): MuiDataViewAppletConfig<any> {
  return {
    // API configuration
    api: createExceptionsApiConfig(),

    // Data schema
    schema: createSchemaConfig(),

    // Table columns
    columns: createExceptionColumns(),

    // Filters
    filters: createExceptionsFilters(),

    // Actions - read-only, so no actions needed
    actions: {
      row: [],
      bulk: [],
      global: [],
    },

    // Forms - read-only, so no forms needed
    forms: {
      create: null,
      edit: null,
    },

    // No pagination - using drill-down instead
    pagination: {
      enabled: false,
    },

    // Activity tracking
    activity: {
      enabled: false, // Read-only data doesn't need activity tracking
    },
  };
}