import React from "react";
import { Box } from "@mui/material";
import type { CardMenuItem } from "@smbc/mui-components";
import {
  FilterList as FilterListIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { ActivityCard } from "./ActivityCard";
import type { EventData } from "../data";

interface ActivityTabProps {
  data: EventData;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ data }) => {
  const activityMenuItems: CardMenuItem[] = [
    {
      label: "Filter",
      icon: <FilterListIcon fontSize="small" />,
      onClick: () => console.log("Filter activity"),
    },
    {
      label: "Refresh",
      icon: <RefreshIcon fontSize="small" />,
      onClick: () => console.log("Refresh activity"),
    },
    {
      label: "Export",
      icon: <ShareIcon fontSize="small" />,
      onClick: () => console.log("Export activity"),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        flex: 1,
        overflowY: "auto",
        p: 0,
        m: 0,
      }}
    >
      <ActivityCard rows={data.activity} menuItems={activityMenuItems} />
    </Box>
  );
};