import React, { useState } from "react";
import {
  Box,
  Button,
  Popover,
  MenuItem,
  MenuList,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccountTree as WorkflowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PsychologyAlt as DiscretionaryIcon,
  Gavel as MandatoryIcon,
  ChipToggleGroup,
  ActionMenu,
} from "@smbc/mui-components";
import { ui, color, shadow } from "@smbc/ui-core";
import { token } from "@smbc/mui-components";
import type { ChipToggleItem, ActionMenuItem } from "@smbc/mui-components";
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
  appliedParams?: any;
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
  /** Menu items for the action menu (vertical dots) */
  actionMenuItems?: ActionMenuItem[];
}

export const ActionBar: React.FC<ActionBarProps> = ({
  values,
  onValuesChange,
  statusCounts = {},
  workflowActions = [],
  selectedItems = [],
  gridRef,
  actionMenuItems = [],
}) => {
  const theme = useTheme();
  const [workflowAnchor, setWorkflowAnchor] = useState<null | HTMLElement>(
    null,
  );

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

  const handleWorkflowClick = (event: React.MouseEvent<HTMLElement>) => {
    setWorkflowAnchor(event.currentTarget);
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

  // Create chip data for ChipToggleGroup
  const filterChips: ChipToggleItem[] = [
    {
      value: "Mandatory",
      label: "Mandatory",
      icon: <MandatoryIcon />,
      count: statusCounts.mandatory ?? 0,
      color: color.status.info500,
      group: "category",
    },
    {
      value: "Discretionary",
      label: "Discretionary",
      icon: <DiscretionaryIcon />,
      count: statusCounts.discretionary ?? 0,
      color: color.tertiary.plum100,
      group: "category",
    },
    {
      value: "on-course",
      label: "On Course",
      icon: <CheckCircleIcon />,
      count: statusCounts.onCourse ?? 0,
      color: token(theme, ui.color.status.success),
      group: "status",
    },
    {
      value: "past-due",
      label: "Past Due",
      icon: <ErrorIcon />,
      count: statusCounts.pastDue ?? 0,
      color: token(theme, ui.color.status.error),
      group: "status",
    },
    {
      value: "almost-due",
      label: "Almost Due",
      icon: <WarningIcon />,
      count: statusCounts.almostDue ?? 0,
      color: token(theme, ui.color.status.warning),
      group: "status",
    },
  ];

  // Handle chip toggle - update URL and apply AG Grid filtering
  const handleChipToggle = (chipValue: string, isActive: boolean) => {
    const chip = filterChips.find((c) => c.value === chipValue);
    if (!chip) return;

    // Update active chips state immediately for visual feedback
    if (isActive) {
      setActiveChips((prev) => [...prev, chipValue]);
    } else {
      setActiveChips((prev) => prev.filter((v) => v !== chipValue));
    }

    // Quick filters need to update state AND URL simultaneously
    const newValues = { ...values };
    if (chip.group === "category") {
      newValues.category = isActive ? chipValue : "";
    } else {
      newValues.status = isActive ? chipValue : "";
    }

    // Update auto-applied state (will sync to URL immediately)
    onValuesChange(newValues);

    // Apply AG Grid filtering if grid is ready
    if (!gridRef?.current?.api) return;

    const gridApi = gridRef.current.api;
    const currentFilters = gridApi.getFilterModel() || {};

    if (chip.group === "category") {
      if (isActive) {
        // Use the correct filter structure for AG Grid text columns
        currentFilters.event_category = {
          type: "equals",
          filter: chipValue,
        };
      } else {
        delete currentFilters.event_category;
      }
    } else {
      // status group - lifecycle_status field
      if (isActive) {
        currentFilters.lifecycle_status = {
          type: "equals",
          filter: chipValue,
        };
      } else {
        delete currentFilters.lifecycle_status;
      }
    }

    gridApi.setFilterModel(currentFilters);
  };

  // Initialize active chips from current filter values
  const [activeChips, setActiveChips] = useState<string[]>(() => {
    const active = [];
    if (values.status) active.push(values.status);
    if (values.category) active.push(values.category);
    return active;
  });

  // Sync activeChips when values change externally (e.g., from URL)
  React.useEffect(() => {
    const active = [];
    if (values.status) active.push(values.status);
    if (values.category) active.push(values.category);
    setActiveChips(active);
  }, [values.status, values.category]);

  return (
    <Box sx={{ p: 2, pb: 0 }}>
      {/* Status Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ChipToggleGroup
          chips={filterChips}
          activeValues={activeChips}
          onChipToggle={handleChipToggle}
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        />

        {/* Right Side Controls */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                border: `1px solid ${token(
                  theme,
                  ui.color.border.secondary,
                )} !important`,
                color: `${token(theme, ui.color.action.disabled)} !important`,
              },
            })}
          >
            Workflow
          </Button>

          {/* Action Menu */}
          <ActionMenu menuItems={actionMenuItems} />
        </Box>
      </Box>

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
            boxShadow: shadow.md,
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
