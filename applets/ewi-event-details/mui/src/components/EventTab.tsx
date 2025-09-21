import React from "react";
import { Box, Typography, Chip, LinearProgress } from "@mui/material";
import { Card } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import {
  Edit as EditIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import { EventDetailsCard } from "./EventDetailsCard";
import { AttachmentsCard } from "./AttachmentsCard";
import type { EventData } from "../data";

interface EventTabProps {
  data: EventData;
}

export const EventTab: React.FC<EventTabProps> = ({ data }) => {

  const eventDetailsMenuItems: CardMenuItem[] = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: () => console.log("Edit event details"),
    },
    {
      label: "Export",
      icon: <ShareIcon fontSize="small" />,
      onClick: () => console.log("Export event details"),
    },
  ];

  const workflowMenuItems: CardMenuItem[] = [
    {
      label: "View History",
      icon: <ArchiveIcon fontSize="small" />,
      onClick: () => console.log("View workflow history"),
    },
    {
      label: "Refresh",
      icon: <RefreshIcon fontSize="small" />,
      onClick: () => console.log("Refresh workflow status"),
    },
  ];

  const attachmentsMenuItems: CardMenuItem[] = [
    {
      label: "Upload",
      icon: <EditIcon fontSize="small" />,
      onClick: () => console.log("Upload attachment"),
    },
    {
      label: "Refresh",
      icon: <RefreshIcon fontSize="small" />,
      onClick: () => console.log("Refresh attachments"),
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
      <EventDetailsCard items={data.eventDetails} menuItems={eventDetailsMenuItems} />
      
      <Card 
        title="Workflow Status" 
        subtitle="Current: 1 LOD Review"
        menuItems={workflowMenuItems}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Chip label="In Progress" color="primary" size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
              3 of 5 steps completed
            </Typography>
          </Box>
          
          <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
          
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label="✓ Created" size="small" variant="outlined" color="success" />
            <Chip label="✓ Submitted" size="small" variant="outlined" color="success" />
            <Chip label="✓ 1 LOD Review" size="small" variant="outlined" color="success" />
            <Chip label="2 LOD Review" size="small" variant="outlined" />
            <Chip label="Completed" size="small" variant="outlined" />
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Last updated: 2 hours ago by Rob Lynn
          </Typography>
        </Box>
      </Card>
      
      <AttachmentsCard rows={data.attachments} menuItems={attachmentsMenuItems} />
    </Box>
  );
};