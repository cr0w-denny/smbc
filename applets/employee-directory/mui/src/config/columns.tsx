/**
 * Column configuration for Employee Directory
 */
import { Chip } from "@mui/material";

export const createColumnsConfig = () => [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    width: "20%",
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    searchable: true,
    width: "25%",
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
    filterable: true,
    width: "20%",
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    width: "20%",
  },
  {
    key: "active",
    label: "Status",
    sortable: true,
    filterable: true,
    width: "15%",
    render: (item: any) => (
      <Chip
        label={item.active ? "Active" : "Inactive"}
        color={item.active ? "success" : "default"}
        size="small"
      />
    ),
  },
];