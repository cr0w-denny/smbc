/**
 * Column configuration for EWI Events
 */
import { Chip } from "@mui/material";

export const createColumnsConfig = () => [
  {
    key: "id",
    label: "Event ID",
    sortable: true,
    searchable: true,
    width: "15%",
  },
  {
    key: "obligor",
    label: "Obligor",
    sortable: true,
    searchable: true,
    width: "25%",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    width: "20%",
    render: (item: any) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case "on-course":
            return "success";
          case "almost-due":
            return "warning";
          case "past-due":
            return "error";
          case "needs-attention":
            return "secondary";
          default:
            return "default";
        }
      };

      return (
        <Chip
          label={item.status.replace("-", " ").toUpperCase()}
          color={getStatusColor(item.status) as any}
          size="small"
        />
      );
    },
  },
  {
    key: "dueDate",
    label: "Due Date",
    sortable: true,
    width: "20%",
  },
  {
    key: "analyst",
    label: "Analyst",
    sortable: true,
    searchable: true,
    width: "20%",
  },
];
