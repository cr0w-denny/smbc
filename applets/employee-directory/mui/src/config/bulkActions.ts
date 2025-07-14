import {
  PersonOff as DeactivateIcon,
  Delete as DeleteIcon,
  CheckCircle as ActivateIcon,
} from "@mui/icons-material";
import type { BulkAction } from "@smbc/react-query-dataview";
import {
  createBulkDeleteAction,
  createBulkUpdateAction,
} from "@smbc/react-query-dataview";
import { getApiClient } from "@smbc/applet-core";
import type { components, paths } from "@smbc/employee-directory-api/generated/types";

type Employee = components["schemas"]["Employee"];

/**
 * Bulk action configuration for Employee Directory
 * 
 * Bulk actions appear in the action bar when rows are selected.
 * They can be conditionally shown based on the selected items.
 */
export const createBulkActionsConfig = (permissions: {
  canEdit: boolean;
  canDelete: boolean;
}): BulkAction<Employee>[] => {
  const actions: BulkAction<Employee>[] = [];

  if (permissions.canEdit) {
    // Bulk activate - use the helper for proper activity tracking
    const activateAction = createBulkUpdateAction<Employee>(
      async (id: string | number, data: Partial<Employee>) => {
        // Use the generated API client to update the employee
        const result = await getApiClient<paths>("employee-directory").PATCH("/employees/{id}", {
          params: { path: { id: id as string } },
          body: data,
        });

        if (!result.data) {
          throw new Error("Failed to update employee");
        }

        return result.data || {};
      },
      { active: true },
      {
        key: "bulk-activate",
        label: "Activate Selected",
        icon: ActivateIcon,
        color: "success",
      },
    );

    actions.push({
      ...activateAction,
      appliesTo: (employee: Employee) => !employee.active,
      requiresAllRows: true, // only show if ALL selected employees can be activated
    });

    // Bulk deactivate - use the same update function with different data
    const deactivateAction = createBulkUpdateAction<Employee>(
      async (id: string | number, data: Partial<Employee>) => {
        // Use the generated API client to update the employee
        const result = await getApiClient<paths>("employee-directory").PATCH("/employees/{id}", {
          params: { path: { id: id as string } },
          body: data,
        });

        if (!result.data) {
          throw new Error("Failed to update employee");
        }

        return result.data || {};
      },
      { active: false },
      {
        key: "bulk-deactivate",
        label: "Deactivate Selected",
        icon: DeactivateIcon,
        color: "warning",
      },
    );

    actions.push({
      ...deactivateAction,
      appliesTo: (employee: Employee) => employee.active,
    });
  }

  if (permissions.canDelete) {
    // Bulk delete - use the helper for proper activity tracking and transaction support
    const deleteAction = createBulkDeleteAction<Employee>(
      async (id: string | number) => {
        // Use the generated API client to delete the employee
        const result = await getApiClient<paths>("employee-directory").DELETE("/employees/{id}", {
          params: { path: { id: id as string } },
        });

        if (!result.data) {
          throw new Error("Failed to delete employee");
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
      appliesTo: (employee: Employee) => {
        return !(employee as any).__pendingDelete;
      },
    });
  }

  return actions;
};