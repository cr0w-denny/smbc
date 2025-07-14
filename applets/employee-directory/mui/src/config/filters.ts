/**
 * Filter configuration for Employee Directory
 */
export const createFiltersConfig = () => ({
  fields: [
    {
      name: "search",
      type: "search" as const,
      label: "Search employees",
      placeholder: "Search by name or email...",
      fullWidth: true,
    },
    {
      name: "department",
      type: "select" as const,
      label: "Department",
      options: [
        { label: "All Departments", value: "" },
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" },
        { label: "Marketing", value: "marketing" },
        { label: "HR", value: "hr" },
        { label: "Finance", value: "finance" },
      ],
    },
    {
      name: "active",
      type: "boolean" as const,
      label: "Active only",
    },
  ],
});