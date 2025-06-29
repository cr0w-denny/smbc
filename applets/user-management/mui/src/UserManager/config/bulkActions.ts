import { Delete as DeleteIcon, Block as BlockIcon, CheckCircle as ActivateIcon } from "@mui/icons-material";
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
      onClick: (users: User[]) => {
        console.log("Bulk activate users:", users);
        // TODO: Implement bulk activation
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
      onClick: (users: User[]) => {
        console.log("Bulk deactivate users:", users);
        // TODO: Implement bulk deactivation
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
      onClick: (users: User[]) => {
        console.log("Bulk delete users:", users);
        // TODO: Implement bulk delete with confirmation
      },
    });
  }

  return actions;
};