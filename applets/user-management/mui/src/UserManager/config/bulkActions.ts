import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
} from "@mui/icons-material";
import type { BulkAction } from "@smbc/react-query-dataview";
import {
  createBulkDeleteAction,
  createBulkUpdateAction,
} from "@smbc/react-query-dataview";
import { apiClient, type components } from "@smbc/user-management-client";

type User = components["schemas"]["User"];

/**
 * Bulk action configuration for the UserManager component
 *
 * Bulk actions appear in the action bar when rows are selected.
 * They can be conditionally shown based on the selected items.
 */
export const createBulkActionsConfig = (permissions: {
  canEdit: boolean;
  canDelete: boolean;
}): BulkAction<User>[] => {
  const actions: BulkAction<User>[] = [];

  if (permissions.canEdit) {
    // Bulk activate - use the helper for proper activity tracking
    const activateAction = createBulkUpdateAction<User>(
      async (id: string | number, data: Partial<User>) => {
        // Use the generated API client to update the user
        const result = await apiClient.PATCH("/users/{id}", {
          params: { path: { id: id as string } },
          body: data,
        });

        if (result.error) {
          throw new Error(result.error.message || "Failed to update user");
        }

        return result.data || {};
      },
      { isActive: true },
      {
        key: "bulk-activate",
        label: "Activate Selected",
        icon: ActivateIcon,
        color: "success",
      },
    );

    actions.push({
      ...activateAction,
      appliesTo: (user: User) => !user.isActive,
      requiresAllRows: true, // only show if ALL selected user can be activated
    });

    // Bulk deactivate - use the same update function with different data
    const deactivateAction = createBulkUpdateAction<User>(
      async (id: string | number, data: Partial<User>) => {
        // Use the generated API client to update the user
        const result = await apiClient.PATCH("/users/{id}", {
          params: { path: { id: id as string } },
          body: data,
        });

        if (result.error) {
          throw new Error(result.error.message || "Failed to update user");
        }

        return result.data || {};
      },
      { isActive: false },
      {
        key: "bulk-deactivate",
        label: "Deactivate Selected",
        icon: BlockIcon,
        color: "warning",
      },
    );

    actions.push({
      ...deactivateAction,
      appliesTo: (user: User) => user.isActive,
    });
  }

  if (permissions.canDelete) {
    // Bulk delete - use the helper for proper activity tracking and transaction support
    const deleteAction = createBulkDeleteAction<User>(
      async (id: string | number) => {
        // Use the generated API client to delete the user
        const result = await apiClient.DELETE("/users/{id}", {
          params: { path: { id: id as string } },
        });

        if (result.error) {
          throw new Error(result.error.message || "Failed to delete user");
        }

        return result.data || {};
      },
      {
        key: "bulk-delete",
        label: "Delete Selected",
        icon: DeleteIcon,
      },
    );

    actions.push({
      ...deleteAction,
      appliesTo: (user: User) => {
        return !(user as any).__pendingDelete;
      },
    });
  }

  return actions;
};
