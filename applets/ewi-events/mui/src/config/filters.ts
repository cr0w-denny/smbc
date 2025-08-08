/**
 * Filter configuration for EWI Events
 */

export const createFiltersConfig = () => [
  {
    key: "dateFrom",
    label: "From Date",
    type: "date" as const,
    operator: "gte",
  },
  {
    key: "dateTo", 
    label: "To Date",
    type: "date" as const,
    operator: "lte",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "On Course", value: "on-course" },
      { label: "Almost Due", value: "almost-due" },
      { label: "Past Due", value: "past-due" },
      { label: "Needs Attention", value: "needs-attention" },
    ],
  },
  {
    key: "exRatings",
    label: "ExRatings",
    type: "text" as const,
    operator: "contains",
  },
  {
    key: "workflow",
    label: "Workflow",
    type: "select" as const,
    options: [
      { label: "1 LOD Review", value: "1LOD" },
      { label: "2 LOD Review", value: "2LOD" },
      { label: "1 LOD Analyst", value: "Analyst" },
    ],
  },
  {
    key: "priority",
    label: "Priority Level",
    type: "select" as const,
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
  },
];