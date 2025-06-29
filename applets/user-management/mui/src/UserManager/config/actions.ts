import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * Action configuration for the UserManager component
 *
 * Actions are conditionally included based on user permissions.
 * onClick handlers are handled by the MuiDataViewApplet component.
 */
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
      // onClick handled by MuiDataViewApplet
    });
  }

  if (permissions.canDelete) {
    actions.push({
      type: "row" as const,
      key: "delete",
      label: "Delete",
      icon: DeleteIcon,
      color: "error" as const,
      // onClick handled by MuiDataViewApplet
    });
  }

  return actions;
};
