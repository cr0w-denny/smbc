import React from "react";
import {
  Box,
  Chip,
  Button,
  IconButton,
  Popover,
  MenuItem,
  MenuList,
  Menu,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PriorityHigh as PriorityHighIcon,
  Settings as SettingsIcon,
  AccountTree as WorkflowIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { BulkAction } from "@smbc/dataview";

interface FilterChipsProps {
  values: {
    dateFrom: string;
    dateTo: string;
    status: string;
    exRatings: string;
    workflow: string;
    priority: string;
  };
  onValuesChange: (values: any) => void;
  statusCounts?: {
    onCourse?: number;
    almostDue?: number;
    pastDue?: number;
    needsAttention?: number;
  };
  /** Workflow actions from DataView bulk actions */
  workflowActions?: BulkAction<any>[];
  /** Selected items for workflow actions */
  selectedItems?: any[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  values,
  onValuesChange,
  statusCounts = {},
  workflowActions = [],
  selectedItems = [],
}) => {
  const [settingsAnchor, setSettingsAnchor] =
    React.useState<null | HTMLElement>(null);
  const [workflowAnchor, setWorkflowAnchor] =
    React.useState<null | HTMLElement>(null);

  // Auto-open workflow dropdown when at least 2 items are selected
  React.useEffect(() => {
    if (selectedItems.length >= 2 && !workflowAnchor) {
      // Auto-open when transitioning to 2+ items
      const workflowButton = document.querySelector(
        '[data-testid="workflow-button"]',
      ) as HTMLElement;
      if (workflowButton) {
        setWorkflowAnchor(workflowButton);
      }
    }
    // Note: Don't close the dropdown when items are still selected
    // Let user explicitly close it or clear all selections
  }, [selectedItems.length >= 2, workflowAnchor]); // Stable dependencies

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleWorkflowClick = (event: React.MouseEvent<HTMLElement>) => {
    setWorkflowAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleWorkflowClose = () => {
    setWorkflowAnchor(null);
  };

  // Close workflow menu when fewer than 2 items are selected
  React.useEffect(() => {
    if (selectedItems.length < 2 && workflowAnchor) {
      setWorkflowAnchor(null);
    }
  }, [selectedItems.length, workflowAnchor]);

  // Reusable function to create status chips with consistent styling
  const createStatusChip = (
    icon: React.ReactElement,
    label: string,
    colorKey: string,
    count: number,
    statusValue: string,
  ) => {
    const isActive = values.status === statusValue;

    return {
      icon: React.cloneElement(icon, {
        sx: { color: `${colorKey}.dark`, fontSize: "18px" },
      }),
      label: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>{label}</span>
          <Box
            component="span"
            sx={(theme: any) => ({
              bgcolor: theme.palette[colorKey].main,
              color: "white",
              borderRadius: "10px",
              px: 0.75,
              fontSize: "0.75rem",
              fontWeight: "bold",
              ml: 0.5,
            })}
          >
            {count}
          </Box>
        </Box>
      ),
      variant: "outlined" as const,
      size: "medium" as const,
      onClick: () => onValuesChange({ ...values, status: statusValue }),
      sx: (theme: any) => ({
        cursor: "pointer",
        bgcolor: isActive ? theme.palette.action.selected : "transparent",
        px: 1,
        height: "auto",
        "& .MuiChip-label": {
          py: 1,
        },
        "& .MuiChip-icon": {
          color: `${theme.palette[colorKey].main} !important`,
        },
      }),
    };
  };

  return (
    <Box sx={{ px: 2 }}>
      {/* Status Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            {...createStatusChip(
              <CheckCircleIcon />,
              "On Course",
              "success",
              statusCounts.onCourse ?? 0,
              "on-course",
            )}
          />
          <Chip
            {...createStatusChip(
              <WarningIcon />,
              "Almost Due",
              "warning",
              statusCounts.almostDue ?? 0,
              "almost-due",
            )}
          />
          <Chip
            {...createStatusChip(
              <ErrorIcon />,
              "Past Due",
              "error",
              statusCounts.pastDue ?? 0,
              "past-due",
            )}
          />
          <Chip
            {...createStatusChip(
              <PriorityHighIcon />,
              "Needs Attention",
              "secondary",
              statusCounts.needsAttention ?? 0,
              "needs-attention",
            )}
          />
        </Box>

        {/* Right Side Controls */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* Settings Gear Icon */}
          <IconButton
            size="small"
            onClick={handleSettingsClick}
            sx={{ color: "text.secondary" }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          {/* Workflow Button */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<WorkflowIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleWorkflowClick}
            disabled={selectedItems.length < 2}
            data-testid="workflow-button"
            sx={(theme) => ({
              textTransform: "none",
              minWidth: 120,
              "&.Mui-disabled": {
                backgroundColor: "transparent !important",
                border: theme.palette.mode === 'dark' 
                  ? "1px solid rgba(255, 255, 255, 0.12) !important"
                  : "1px solid rgba(0, 0, 0, 0.12) !important",
                color: theme.palette.mode === 'dark'
                  ? "rgba(255, 255, 255, 0.3) !important"
                  : "rgba(0, 0, 0, 0.26) !important",
              },
            })}
          >
            Workflow
          </Button>
        </Box>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleSettingsClose}>Export Data</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Print Report</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Column Settings</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Reset Filters</MenuItem>
      </Menu>

      {/* Workflow Menu */}
      <Popover
        anchorEl={workflowAnchor}
        open={Boolean(workflowAnchor)}
        onClose={handleWorkflowClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disablePortal={false}
        hideBackdrop
        disableScrollLock
        sx={{
          pointerEvents: "none",
          "& .MuiPopover-root": {
            pointerEvents: "none",
          },
          "& .MuiPaper-root": {
            pointerEvents: "auto",
            boxShadow:
              "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
          },
        }}
      >
        <MenuList>
          {workflowActions.length > 0 ? (
            workflowActions.map((action) => (
              <MenuItem
                key={action.key}
                onClick={() => {
                  handleWorkflowClose();
                  action.onClick?.(selectedItems);
                }}
                disabled={action.disabled?.(selectedItems)}
              >
                {action.icon && React.createElement(action.icon)}
                {action.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              No actions available for selected items
            </MenuItem>
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};
