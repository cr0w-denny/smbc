import React, { useEffect, useState } from "react";
import {
  Snackbar,
  IconButton,
  Paper,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useActivity } from "@smbc/react-dataview";
import type { ActivityItem } from "@smbc/react-dataview";

const ActivityTypeIcons = {
  create: AddIcon,
  update: EditIcon,
  delete: DeleteIcon,
} as const;

const ActivityTypeMessages = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
} as const;

const ActivityTypeColors = {
  create: "success" as const,
  update: "info" as const,
  delete: "warning" as const,
} as const;

export interface ActivitySnackbarProps {
  /** Duration in milliseconds to show the snackbar */
  autoHideDuration?: number;
  /** Called when user clicks to view an item */
  onNavigate?: (url: string) => void;
}

export function ActivitySnackbar({
  autoHideDuration = 4000,
  onNavigate,
}: ActivitySnackbarProps) {
  const { activities } = useActivity();
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  // Show snackbar for the most recent activity
  useEffect(() => {
    if (activities.length > 0) {
      const latest = activities[0];
      // Only show if this is a different activity than currently shown
      if (!currentActivity || latest.id !== currentActivity.id) {
        setCurrentActivity(latest);
        setOpen(true);
      }
    }
  }, [activities, currentActivity]);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleAction = () => {
    if (currentActivity?.url && onNavigate) {
      onNavigate(currentActivity.url);
      setOpen(false);
    }
  };

  if (!currentActivity) {
    return null;
  }

  const Icon =
    ActivityTypeIcons[currentActivity.type as keyof typeof ActivityTypeIcons];
  const message =
    ActivityTypeMessages[
      currentActivity.type as keyof typeof ActivityTypeMessages
    ];
  const severity =
    ActivityTypeColors[currentActivity.type as keyof typeof ActivityTypeColors];

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          minWidth: "320px",
          maxWidth: "500px",
          backgroundColor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Chip
          icon={<Icon />}
          label={message}
          color={severity}
          size="small"
          variant="filled"
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentActivity.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentActivity.entityType}
          </Typography>
        </Box>
        {currentActivity.url && onNavigate && (
          <IconButton
            size="small"
            onClick={handleAction}
            aria-label="view"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Snackbar>
  );
}
