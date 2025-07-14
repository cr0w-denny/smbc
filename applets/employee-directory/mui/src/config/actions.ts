/**
 * Row action configuration for Employee Directory
 */
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export const createActionsConfig = (permissions: {
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const actions = [];

  if (permissions.canEdit) {
    actions.push({
      type: "row" as const,
      key: "edit",
      label: "Edit",
      icon: EditIcon,
      color: "primary" as const,
    });
  }

  if (permissions.canDelete) {
    actions.push({
      type: "row" as const,
      key: "delete",
      label: "Delete",
      icon: DeleteIcon,
      color: "error" as const,
    });
  }

  return actions;
};