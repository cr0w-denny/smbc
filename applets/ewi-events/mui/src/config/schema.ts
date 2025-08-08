/**
 * Schema configuration for EWI Events
 */

export const createSchemaConfig = () => ({
  primaryKey: "id" as const,
  displayName: (item: any) => `Event ${item.id}`,
  fields: [
    {
      name: "id",
      type: "string" as const,
      label: "Event ID",
      required: true,
    },
    {
      name: "obligor",
      type: "string" as const,
      label: "Obligor",
      required: true,
    },
    {
      name: "status",
      type: "select" as const,
      label: "Status",
      options: [
        { label: "On Course", value: "on-course" },
        { label: "Almost Due", value: "almost-due" },
        { label: "Past Due", value: "past-due" },
        { label: "Needs Attention", value: "needs-attention" },
      ],
      required: true,
    },
    {
      name: "dueDate",
      type: "string" as const,
      label: "Due Date",
      required: true,
    },
    {
      name: "analyst",
      type: "string" as const,
      label: "Analyst",
      required: true,
    },
  ],
});