import React from "react";
import { Box } from "@mui/material";
import type { CardMenuItem } from "@smbc/mui-components";
import {
  Edit as EditIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { ObligorDetailsCard } from "./ObligorDetailsCard";
import type { EventData } from "../data";

interface ObligorTabProps {
  data: EventData;
}

export const ObligorTab: React.FC<ObligorTabProps> = ({ data }) => {
  const obligorMenuItems: CardMenuItem[] = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: () => console.log("Edit obligor details"),
    },
    {
      label: "Assign Officer",
      icon: <PersonAddIcon fontSize="small" />,
      onClick: () => console.log("Assign officer"),
    },
    {
      label: "Export",
      icon: <ShareIcon fontSize="small" />,
      onClick: () => console.log("Export obligor details"),
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
      <ObligorDetailsCard items={data.obligorDetails} menuItems={obligorMenuItems} />
    </Box>
  );
};