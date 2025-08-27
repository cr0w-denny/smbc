import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import type { GlobalAction } from "@smbc/dataview";

/**
 * Global action configuration for the UserManager component
 *
 * Global actions appear in the action bar and are always visible.
 * They typically handle operations that don't depend on selected rows.
 */
export const createGlobalActionsConfig = (permissions: {
  canCreate: boolean;
}): GlobalAction[] => {
  const actions: GlobalAction[] = [];

  if (permissions.canCreate) {
    actions.push({
      type: "global",
      key: "create",
      label: "Create User",
      icon: AddIcon,
      color: "primary" as const,
      onClick: () => {
        // This will be handled by the MuiDataViewApplet automatically
      },
    });
  }

  // Export action - always available
  actions.push({
    type: "global",
    key: "export",
    label: "Export",
    icon: ExportIcon,
    color: "primary" as const,
    onClick: () => {
      // TODO: Implement export functionality
    },
  });

  // Refresh action - always available
  actions.push({
    type: "global",
    key: "refresh",
    label: "Refresh",
    icon: RefreshIcon,
    color: "primary" as const,
    onClick: () => {
      // TODO: Implement refresh functionality
    },
  });

  return actions;
};
