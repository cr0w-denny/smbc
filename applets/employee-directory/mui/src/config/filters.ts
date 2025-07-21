/**
 * Filter configuration for Employee Directory
 */
export const createFiltersConfig = () => ({
  title: "Employees",
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
        { label: "Customer Support", value: "Customer Support" },
        { label: "Engineering", value: "Engineering" },
        { label: "Finance", value: "Finance" },
        { label: "HR", value: "HR" },
        { label: "IT", value: "IT" },
        { label: "Legal", value: "Legal" },
        { label: "Marketing", value: "Marketing" },
        { label: "Operations", value: "Operations" },
        { label: "Sales", value: "Sales" },
      ],
    },
    {
      name: "active",
      type: "boolean",
      label: "Active employees only",
      defaultValue: false,
    },
  ],
  initialValues: {
    search: "",
    department: "",
    active: false,
  },
  debounceMs: 300,
});
