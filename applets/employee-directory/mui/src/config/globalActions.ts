/**
 * Global action configuration for Employee Directory
 */
import { Add as AddIcon } from "@mui/icons-material";

export const createGlobalActionsConfig = (permissions: {
  canCreate: boolean;
}) => {
  const actions = [];

  if (permissions.canCreate) {
    actions.push({
      type: "global" as const,
      key: "create",
      label: "Add Employee",
      icon: AddIcon,
      color: "primary" as const,
      variant: "contained" as const,
    });
  }

  return actions;
};