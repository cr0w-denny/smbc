import React from "react";
import {
  Box,
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
  Settings as SettingsIcon,
  AccountTree as WorkflowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PsychologyAlt as DiscretionaryIcon,
  Gavel as MandatoryIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  ViewColumn as ColumnIcon,
  FilterListOff as ResetFiltersIcon,
  FilterChipToggle,
} from "@smbc/mui-components";
import type { FilterChip } from "@smbc/mui-components";
interface BulkAction {
  type: "bulk";
  key: string;
  label: string;
  icon?: React.ComponentType;
  color?: "primary" | "secondary" | "success" | "error" | "warning";
  onClick?: (selectedItems: any[]) => void;
  disabled?: (selectedItems: any[]) => boolean;
  appliesTo?: (item: any) => boolean;
}

interface ActionBarProps {
  values: Record<string, any> & {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    category?: string;
    exRatings?: string;
    workflow?: string;
    priority?: string;
  };
  onValuesChange: (values: any) => void;
  onApply?: (values?: any) => void;
  statusCounts?: {
    onCourse?: number;
    almostDue?: number;
    pastDue?: number;
    discretionary?: number;
    mandatory?: number;
  };
  /** Workflow actions from AG Grid actions */
  workflowActions?: BulkAction[];
  /** Selected items for workflow actions */
  selectedItems?: any[];
  /** Reference to AG Grid instance */
  gridRef?: React.RefObject<any>;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  values,
  onValuesChange,
  onApply,
  statusCounts = {},
  workflowActions = [],
  selectedItems = [],
  gridRef,
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

  // Create chip data for FilterChipToggle
  const filterChips: FilterChip[] = [
    {
      value: "Mandatory",
      label: "Mandatory",
      icon: <MandatoryIcon />,
      count: statusCounts.mandatory ?? 0,
      style: { border: "#0066CC", badge: "#0066CC", fill: "#F0F8FF" },
      group: "category",
    },
    {
      value: "Discretionary",
      label: "Discretionary",
      icon: <DiscretionaryIcon />,
      count: statusCounts.discretionary ?? 0,
      style: { border: "#6B46C1", badge: "#6B46C1", fill: "#F8F6FF" },
      group: "category",
    },
    {
      value: "on-course",
      label: "On Course",
      icon: <CheckCircleIcon />,
      count: statusCounts.onCourse ?? 0,
      style: { border: "#12A187", badge: "#12A187", fill: "#FAFDFD" },
      group: "status",
    },
    {
      value: "past-due",
      label: "Past Due",
      icon: <ErrorIcon />,
      count: statusCounts.pastDue ?? 0,
      style: { border: "#CD463C", badge: "#CD463C", fill: "#FDF9F9" },
      group: "status",
    },
    {
      value: "almost-due",
      label: "Almost Due",
      icon: <WarningIcon />,
      count: statusCounts.almostDue ?? 0,
      style: { border: "#FD992E", badge: "#FD992E", fill: "#FAFDFD" },
      group: "status",
    },
  ];

  // Handle chip toggle - apply immediately
  const handleChipToggle = (chipValue: string, isActive: boolean) => {
    const chip = filterChips.find(c => c.value === chipValue);
    if (!chip) return;

    const newValues = { ...values };
    if (chip.group === "category") {
      newValues.category = isActive ? chipValue : "";
    } else {
      newValues.status = isActive ? chipValue : "";
    }

    onValuesChange(newValues);
    // Apply immediately for chips
    if (onApply) {
      onApply(newValues);
    }
  };

  // Get active chip values
  const activeChips = [];
  if (values.status) activeChips.push(values.status);
  if (values.category) activeChips.push(values.category);

  return (
    <Box sx={{ pt: 2, px: 2 }}>
      {/* Status Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FilterChipToggle
          chips={filterChips}
          activeValues={activeChips}
          onChipToggle={handleChipToggle}
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        />

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
            endIcon={
              Boolean(workflowAnchor) ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={handleWorkflowClick}
            disabled={selectedItems.length < 2}
            data-testid="workflow-button"
            sx={(theme) => ({
              textTransform: "none",
              minWidth: 120,
              "&.Mui-disabled": {
                backgroundColor: "transparent !important",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.12) !important"
                    : "1px solid rgba(0, 0, 0, 0.12) !important",
                color:
                  theme.palette.mode === "dark"
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
        slotProps={{
          paper: {
            sx: {
              boxShadow:
                "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        <MenuItem onClick={handleSettingsClose}>
          <ExportIcon fontSize="small" sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
        <MenuItem onClick={handleSettingsClose}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          Print Report
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleSettingsClose();
            // Show AG Grid's column chooser
            if (gridRef?.current?.api) {
              gridRef.current.api.showColumnChooser();
            }
          }}
        >
          <ColumnIcon fontSize="small" sx={{ mr: 1 }} />
          Column Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleSettingsClose();
            // Reset all filter values
            const resetValues = {
              dateFrom: "",
              dateTo: "",
              status: "",
              category: "",
              exRatings: "",
              workflow: "",
              priority: "",
              types: "",
              plo: "",
              my: "",
            };
            onValuesChange(resetValues);
            // Clear AG Grid filters if available
            if (gridRef?.current?.api) {
              gridRef.current.api.setFilterModel(null);
            }
            // Automatically apply the reset - directly update URL with reset values
            if (onApply) {
              // Pass reset values directly to ensure they're applied
              onApply(resetValues);
            }
          }}
        >
          <ResetFiltersIcon fontSize="small" sx={{ mr: 1 }} />
          Reset Filters
        </MenuItem>
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
          mt: 1,
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
                {action.icon && (
                  <Box
                    component={action.icon}
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                )}
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
