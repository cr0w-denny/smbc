/**
 * EWI Events Configuration System
 */

import { useMemo } from "react";
import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import type { components } from "@smbc/ewi-events-api/types";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as AssignIcon,
  PriorityHigh as PriorityIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { useApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createColumnsConfig } from "./columns";
import { createFiltersConfig } from "./filters";

type Event = components["schemas"]["Event"];

export interface EventsConfigOptions {
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

/**
 * Create EWI Events configuration
 */
export function useEventsConfig({
  permissions,
}: EventsConfigOptions): MuiDataViewAppletConfig<Event> {
  const apiConfig = useApiConfig();
  
  const config = useMemo(() => ({
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
      row: [
        {
          type: "row" as const,
          key: "view",
          label: "View Details",
          icon: ViewIcon,
          onClick: (item: Event) => {
            console.log("View event:", item);
            // TODO: Navigate to detail view
          },
        },
        {
          type: "row" as const,
          key: "edit",
          label: "Edit Event",
          icon: EditIcon,
          onClick: (item: Event) => {
            console.log("Edit event:", item);
            // TODO: Open edit dialog
          },
          hidden: () => !permissions.canEdit,
        },
        {
          type: "row" as const,
          key: "delete",
          label: "Delete Event",
          icon: DeleteIcon,
          color: "error" as const,
          onClick: (item: Event) => {
            console.log("Delete event:", item);
            // TODO: Confirm and delete
          },
          hidden: () => !permissions.canDelete,
        },
      ],
      bulk: [
        {
          type: "bulk" as const,
          key: "bulk-approve",
          label: "Bulk Approve",
          icon: ApproveIcon,
          color: "success" as const,
          onClick: (selectedItems: Event[]) => {
            console.log("Bulk approve:", selectedItems);
            // TODO: Implement bulk approve logic
          },
          appliesTo: (event: Event) => event.status !== "on-course",
        },
        {
          type: "bulk" as const,
          key: "bulk-reject",
          label: "Bulk Reject",
          icon: RejectIcon,
          color: "error" as const,
          onClick: (selectedItems: Event[]) => {
            console.log("Bulk reject:", selectedItems);
            // TODO: Implement bulk reject logic
          },
          appliesTo: (event: Event) => event.status !== "past-due",
        },
        {
          type: "bulk" as const,
          key: "assign-user",
          label: "Assign to User",
          icon: AssignIcon,
          color: "primary" as const,
          onClick: (selectedItems: Event[]) => {
            console.log("Assign to user:", selectedItems);
            // TODO: Implement assign user logic
          },
        },
        {
          type: "bulk" as const,
          key: "change-priority",
          label: "Change Priority",
          icon: PriorityIcon,
          color: "warning" as const,
          onClick: (selectedItems: Event[]) => {
            console.log("Change priority:", selectedItems);
            // TODO: Implement change priority logic
          },
        },
      ],
      global: [],
    },

    // Forms - none for now
    forms: {},

    // Pagination
    pagination: {
      enabled: true,
      defaultPageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
    },

    // Activity tracking
    activity: {
      enabled: true,
      entityType: "event",
      labelGenerator: (event: Event) => `Event ${event.id}`,
      urlGenerator: (event: Event) => `#/ewi-events/${event.id}`,
    },

    // Renderer configuration
    rendererConfig: {
      useRowActionsMenu: true, // Use dropdown menu for row actions
    },
  }), [apiConfig, permissions]);
  
  return config;
}