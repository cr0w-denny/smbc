import React from "react";
import { Box } from "@mui/material";
import type { CardMenuItem } from "@smbc/mui-components";
import {
  Edit as EditIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { TriggerDetailsCard } from "./TriggerDetailsCard";
import { TriggerValuesCard } from "./TriggerValuesCard";
import type { EventData } from "../data";

interface TriggerTabProps {
  data: EventData;
}

export const TriggerTab: React.FC<TriggerTabProps> = ({ data }) => {

  const triggerDetailsMenuItems: CardMenuItem[] = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: () => console.log("Edit trigger details"),
    },
    {
      label: "Export",
      icon: <ShareIcon fontSize="small" />,
      onClick: () => console.log("Export trigger details"),
    },
  ];

  const triggerValuesMenuItems: CardMenuItem[] = [
    {
      label: "Refresh",
      icon: <RefreshIcon fontSize="small" />,
      onClick: () => console.log("Refresh trigger values"),
    },
    {
      label: "Export",
      icon: <ShareIcon fontSize="small" />,
      onClick: () => console.log("Export trigger values"),
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
      <TriggerDetailsCard items={data.triggerDetails} menuItems={triggerDetailsMenuItems} />
      <TriggerValuesCard rows={data.triggerValues} menuItems={triggerValuesMenuItems} />
    </Box>
  );
};