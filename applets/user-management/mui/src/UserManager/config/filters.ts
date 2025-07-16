/**
 * Filter configuration for the UserManager component
 */
export const createFiltersConfig = () => ({
  title: "Users",
  fields: [
    {
      name: "search",
      type: "search" as const,
      label: "Search users...",
      placeholder: "Search users...",
      fullWidth: true,
    },
    {
      name: "status",
      type: "select" as const,
      label: "Status",
      options: [
        { label: "All Statuses", value: undefined },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      name: "sortBy",
      type: "select" as const,
      label: "Sort By",
      options: [
        { label: "Username", value: "username" },
        { label: "First Name", value: "firstName" },
        { label: "Last Name", value: "lastName" },
        { label: "Email", value: "email" },
        { label: "Created Date", value: "createdAt" },
      ],
      defaultValue: "firstName",
      excludeFromCount: true,
    },
    {
      name: "sortOrder",
      type: "select" as const,
      label: "Sort Order",
      options: [
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ],
      defaultValue: "asc",
      excludeFromCount: true,
    },
    {
      name: "format",
      type: "checkbox" as const,
      label: "Show Details",
      defaultValue: false,
    },
  ],
  initialValues: {
    search: "",
    email: undefined,
    status: undefined,
    sortBy: "firstName",
    sortOrder: "asc",
    format: false,
  },
  collapsible: true,
  defaultCollapsed: false,
  showClearButton: true,
  showFilterCount: true,
  debounceMs: 300,
});

/**
 * Filter values interface
 */
interface FilterValues {
  format?: boolean | string;
  [key: string]: unknown;
}

/**
 * Transform filter values for API consumption
 */
export const transformFilters = (filters: FilterValues) => {
  const transformed = { ...filters };

  // Transform checkbox format to API format parameter
  if (transformed.format === true) {
    transformed.format = "detailed";
  } else if (transformed.format === false) {
    delete transformed.format; // Don't send format=false
  }

  return transformed;
};
