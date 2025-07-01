/**
 * Form configuration for the UserManager component
 */
export const createFormsConfig = (permissions: {
  canCreate: boolean;
  canEdit: boolean;
}) => ({
  create: permissions.canCreate
    ? {
        fields: [
          {
            name: "firstName",
            type: "string" as const,
            label: "First Name",
            required: true,
          },
          {
            name: "lastName",
            type: "string" as const,
            label: "Last Name",
            required: true,
          },
          {
            name: "email",
            type: "email" as const,
            label: "Email",
            required: true,
          },
        ],
        title: "Create New User",
        submitLabel: "Create",
        cancelLabel: "Cancel",
      }
    : undefined,
  edit: permissions.canEdit
    ? {
        fields: [
          {
            name: "firstName",
            type: "string" as const,
            label: "First Name",
            required: true,
          },
          {
            name: "lastName",
            type: "string" as const,
            label: "Last Name",
            required: true,
          },
          {
            name: "isActive",
            type: "boolean" as const,
            label: "Active",
          },
        ],
        title: "Edit User",
        submitLabel: "Update",
        cancelLabel: "Cancel",
      }
    : undefined,
});
