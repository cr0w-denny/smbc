/**
 * Form configuration for Employee Directory
 */
export const createFormsConfig = (permissions: {
  canCreate: boolean;
  canEdit: boolean;
}) => ({
  create: permissions.canCreate
    ? {
        fields: [
          {
            name: "name",
            type: "string" as const,
            label: "Full Name",
            required: true,
          },
          {
            name: "email",
            type: "email" as const,
            label: "Email",
            required: true,
          },
          {
            name: "department",
            type: "select" as const,
            label: "Department",
            required: true,
            options: [
              { label: "Engineering", value: "engineering" },
              { label: "Sales", value: "sales" },
              { label: "Marketing", value: "marketing" },
              { label: "HR", value: "hr" },
              { label: "Finance", value: "finance" },
            ],
          },
          {
            name: "role",
            type: "string" as const,
            label: "Role",
            required: true,
          },
          {
            name: "active",
            type: "boolean" as const,
            label: "Active",
            defaultValue: true,
          },
        ],
        title: "Add New Employee",
        submitLabel: "Create Employee",
        cancelLabel: "Cancel",
      }
    : undefined,
  edit: permissions.canEdit
    ? {
        fields: [
          {
            name: "name",
            type: "string" as const,
            label: "Full Name",
            required: true,
          },
          {
            name: "email",
            type: "email" as const,
            label: "Email",
            required: true,
          },
          {
            name: "department",
            type: "select" as const,
            label: "Department",
            required: true,
            options: [
              { label: "Engineering", value: "engineering" },
              { label: "Sales", value: "sales" },
              { label: "Marketing", value: "marketing" },
              { label: "HR", value: "hr" },
              { label: "Finance", value: "finance" },
            ],
          },
          {
            name: "role",
            type: "string" as const,
            label: "Role",
            required: true,
          },
          {
            name: "active",
            type: "boolean" as const,
            label: "Active",
          },
        ],
        title: "Edit Employee",
        submitLabel: "Update Employee",
        cancelLabel: "Cancel",
      }
    : undefined,
});