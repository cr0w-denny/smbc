import React from "react";
import {
  Dashboard,
  Approval,
  Business,
  Analytics,
} from "@mui/icons-material";

export const navigation = [
  {
    label: "Events",
    type: "dropdown" as const,
    items: [
      {
        label: "Event Workflow Dashboard",
        href: "/events",
        icon: <Dashboard />,
      },
      {
        label: "Event Workflow Approvals",
        href: "/approvals",
        icon: <Approval />,
      },
    ],
  },
  {
    label: "Obligors",
    type: "link" as const,
    href: "/obligors",
  },
  {
    label: "Reporting",
    type: "dropdown" as const,
    items: [{
      label: "Usage Stats",
      href: "/usage-stats",
      icon: <Analytics />,
    }],
  },
];
