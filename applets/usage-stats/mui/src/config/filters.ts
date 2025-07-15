export const createUserUsageFilters = () => ({
  fields: [
    {
      name: "start_date",
      type: "date" as const,
      label: "Start Date",
      required: true,
    },
    {
      name: "end_date", 
      type: "date" as const,
      label: "End Date",
      required: true,
    },
    {
      name: "ui_filter",
      type: "text" as const,
      label: "UI Component Filter",
      placeholder: "Filter by component name...",
    },
  ],
});

export const createUIUsageFilters = () => ({
  fields: [
    {
      name: "start_date",
      type: "date" as const,
      label: "Start Date", 
      required: true,
    },
    {
      name: "end_date",
      type: "date" as const,
      label: "End Date",
      required: true,
    },
    {
      name: "user_email",
      type: "text" as const,
      label: "User Email",
      placeholder: "Filter by user email...",
    },
  ],
});

export const createExceptionsFilters = () => ({
  fields: [
    {
      name: "start_date",
      type: "date" as const,
      label: "Start Date",
      required: true,
    },
    {
      name: "end_date",
      type: "date" as const,
      label: "End Date",
      required: true,
    },
  ],
});