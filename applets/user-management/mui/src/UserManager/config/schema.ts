import type { components } from "@smbc/user-management-api/generated/types";

type User = components["schemas"]["User"];

/**
 * Creates data schema configuration for the UserManager component
 *
 * Defines field types, validation rules, and display names for user data.
 *
 * @returns Schema configuration object for the data view applet
 */
export const createSchemaConfig = () => ({
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
    {
      name: "isActive",
      type: "boolean" as const,
      label: "Active",
    },
  ],
  primaryKey: "id" as const,
  displayName: (user: User) => `${user.firstName} ${user.lastName}`,
});
