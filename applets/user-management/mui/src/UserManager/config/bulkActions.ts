import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
} from "@mui/icons-material";
import type { BulkAction } from "@smbc/applet-core";
import type { components } from "@smbc/user-management-client";

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
    // Bulk activate - only show if at least one inactive user is selected
    actions.push({
      type: "bulk",
      key: "bulk-activate",
      label: "Activate Selected",
      icon: ActivateIcon,
      color: "success" as const,
      onClick: async (users: User[], mutations?: any) => {
        if (!mutations?.updateMutation) {
          return;
        }

        try {
          // Update each user to set isActive: true
          await Promise.all(
            users.map(async (user) => {
              await mutations.updateMutation.mutate({
                params: { path: { id: user.id } },
                body: { ...user, isActive: true },
              });
            }),
          );

          // Clear selection after successful bulk operation
          mutations?.clearSelection?.();
        } catch (error) {
          console.error("Failed to activate users:", error);
        }
      },
      appliesTo: (user: User) => !user.isActive,
      requiresAllRows: false, // Show if ANY selected user can be activated
    });

    // Bulk deactivate - only show if at least one active user is selected
    actions.push({
      type: "bulk",
      key: "bulk-deactivate",
      label: "Deactivate Selected",
      icon: BlockIcon,
      color: "warning" as const,
      onClick: async (users: User[], mutations?: any) => {
        if (!mutations?.updateMutation) {
          return;
        }

        try {
          // Update each user to set isActive: false
          await Promise.all(
            users.map(async (user) => {
              await mutations.updateMutation.mutate({
                params: { path: { id: user.id } },
                body: { ...user, isActive: false },
              });
            }),
          );
        } catch (error) {
          console.error("Failed to deactivate users:", error);
        }
      },
      appliesTo: (user: User) => user.isActive,
      requiresAllRows: false, // Show if ANY selected user can be deactivated
    });
  }

  if (permissions.canDelete) {
    // Bulk delete - always show when users are selected
    actions.push({
      type: "bulk",
      key: "bulk-delete",
      label: "Delete Selected",
      icon: DeleteIcon,
      color: "error" as const,
      onClick: async (users: User[], mutations?: any) => {
        if (!mutations?.deleteMutation) {
          return;
        }

        try {
          // Delete each user
          await Promise.all(
            users.map(async (user) => {
              await mutations.deleteMutation.mutate({
                params: { path: { id: user.id } },
              });
            }),
          );
        } catch (error) {
          console.error("Failed to delete users:", error);
        }
      },
    });
  }

  return actions;
};
