import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

/**
 * Action configuration for the UserManager component
 *
 * Actions are conditionally included based on user permissions.
 * onClick handlers are handled by the MuiDataViewApplet component.
 */
export const createActionsConfig = (
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  },
  handlers?: {
    onViewUser?: (user: any) => void;
  },
) => {
  const actions = [];

  // View action is always available
  actions.push({
    type: "row" as const,
    key: "view",
    label: "View",
    icon: ViewIcon,
    color: "primary" as const,
    onClick: handlers?.onViewUser,
  });

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
