/**
 * Schema configuration for Employee Directory
 */
import type { components } from "@smbc/employee-directory-api/generated/types";

type Employee = components["schemas"]["Employee"];

export const createSchemaConfig = () => ({
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
      type: "string" as const,
      label: "Department",
      required: true,
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
  primaryKey: "id" as const,
  displayName: (employee: Employee) => employee.name,
});