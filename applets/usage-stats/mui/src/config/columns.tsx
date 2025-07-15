export const createUserUsageColumns = () => [
  {
    key: "email",
    label: "User Email",
    sortable: true,
    searchable: true,
    width: "40%",
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    width: "35%",
  },
  {
    key: "count",
    label: "Usage Count",
    sortable: true,
    width: "25%",
    align: "right" as const,
  },
];

export const createComponentUsageColumns = () => [
  {
    key: "component",
    label: "Component",
    sortable: true,
    searchable: true,
    width: "70%",
  },
  {
    key: "count",
    label: "Usage Count",
    sortable: true,
    width: "30%",
    align: "right" as const,
  },
];

export const createExceptionColumns = () => [
  {
    key: "email",
    label: "User Email",
    sortable: true,
    searchable: true,
    width: "40%",
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    width: "35%",
  },
  {
    key: "count",
    label: "Exception Count",
    sortable: true,
    width: "25%",
    align: "right" as const,
  },
];