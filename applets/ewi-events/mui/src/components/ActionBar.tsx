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
  PsychologyAlt as DiscretionaryIcon,
  Gavel as MandatoryIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  ViewColumn as ColumnIcon,
  FilterListOff as ResetFiltersIcon,
} from "@mui/icons-material";
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
  statusCounts?: {
    onCourse?: number;
    almostDue?: number;
    pastDue?: number;
    needsAttention?: number;
    discretionary?: number;
    mandatory?: number;
  };
  /** Workflow actions from AG Grid actions */
  workflowActions?: BulkAction[];
  /** Selected items for workflow actions */
  selectedItems?: any[];
}

export const ActionBar: React.FC<ActionBarProps> = ({
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

  // Reusable function to create filter chips with consistent styling
  const createStatusChip = (
    icon: React.ReactElement,
    label: string,
    colors: { border: string; badge: string; fill: string },
    count: number,
    statusValue: string,
    paramType: 'status' | 'category' = 'status',
  ) => {
    const isActive = paramType === 'category' ? values.category === statusValue : values.status === statusValue;

    return {
      label: (
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          width: "100%",
          gap: 1
        }}>
          {/* Left: Icon in light gray circle */}
          <Box sx={(theme: any) => ({ 
            width: 24, 
            height: 24, 
            borderRadius: "50%",
            backgroundColor: isActive 
              ? "#FFFFFF" 
              : theme.palette.mode === "dark" 
                ? "rgba(255, 255, 255, 0.1)" 
                : "#F0F0F0",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: 0
          })}>
            {React.cloneElement(icon, {
              sx: { 
                fontSize: "18px", 
                width: "18px", 
                height: "18px",
                color: isActive ? colors.badge : colors.badge
              },
            })}
          </Box>
          
          {/* Center: Label */}
          <Box sx={(theme: any) => ({ 
            flex: 1, 
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 500,
            color: isActive 
              ? "#FFFFFF" 
              : theme.palette.mode === "dark" 
                ? theme.palette.text.primary 
                : "#1A1A1A"
          })}>
            {label}
          </Box>
          
          {/* Right: Count badge */}
          <Box
            component="span"
            sx={{
              bgcolor: isActive ? "#FFFFFF" : colors.badge,
              color: isActive ? colors.badge : "#FFFFFF",
              borderRadius: "50%",
              minWidth: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              flexShrink: 0
            }}
          >
            {count}
          </Box>
        </Box>
      ),
      variant: "outlined" as const,
      size: "medium" as const,
      onClick: () => {
        // Toggle behavior: if already selected, deselect it
        if (paramType === 'category') {
          const newCategory = values.category === statusValue ? "" : statusValue;
          onValuesChange({ ...values, category: newCategory });
        } else {
          const newStatus = values.status === statusValue ? "" : statusValue;
          onValuesChange({ ...values, status: newStatus });
        }
      },
      sx: (theme: any) => ({
        cursor: "pointer",
        backgroundColor: isActive 
          ? colors.badge 
          : theme.palette.mode === "dark" 
            ? theme.palette.background.paper 
            : "#FFFFFF",
        border: `1px solid ${colors.border}`,
        borderRadius: "20px",
        minWidth: theme.breakpoints.values.xl >= 1920 ? "187px" : "150px",
        height: "auto",
        padding: "8px 12px",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        transition: "none !important",
        "&:hover": {
          backgroundColor: `${isActive 
            ? colors.badge 
            : theme.palette.mode === "dark" 
              ? theme.palette.background.paper 
              : "#FFFFFF"} !important`,
          transform: "translateY(-1px)",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        },
        "&.MuiChip-clickable:hover": {
          backgroundColor: `${isActive 
            ? colors.badge 
            : theme.palette.mode === "dark" 
              ? theme.palette.background.paper 
              : "#FFFFFF"} !important`,
        },
        "& .MuiChip-label": {
          padding: 0,
          display: "flex",
          alignItems: "center",
          width: "100%",
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
              { border: "#12A187", badge: "#12A187", fill: "#FAFDFD" },
              statusCounts.onCourse ?? 0,
              "on-course",
            )}
          />
          <Chip
            {...createStatusChip(
              <WarningIcon />,
              "Almost Due",
              { border: "#FD992E", badge: "#FD992E", fill: "#FAFDFD" },
              statusCounts.almostDue ?? 0,
              "almost-due",
            )}
          />
          <Chip
            {...createStatusChip(
              <ErrorIcon />,
              "Past Due",
              { border: "#CD463C", badge: "#CD463C", fill: "#FDF9F9" },
              statusCounts.pastDue ?? 0,
              "past-due",
            )}
          />
          <Chip
            {...createStatusChip(
              <PriorityHighIcon />,
              "Needs Attention",
              { border: "#A32B9A", badge: "#A32B9A", fill: "#FFFFFF" },
              statusCounts.needsAttention ?? 0,
              "needs-attention",
            )}
          />
          <Chip
            {...createStatusChip(
              <DiscretionaryIcon />,
              "Discretionary",
              { border: "#6B46C1", badge: "#6B46C1", fill: "#F8F6FF" },
              statusCounts.discretionary ?? 0,
              "Discretionary",
              "category",
            )}
          />
          <Chip
            {...createStatusChip(
              <MandatoryIcon />,
              "Mandatory",
              { border: "#0066CC", badge: "#0066CC", fill: "#F0F8FF" },
              statusCounts.mandatory ?? 0,
              "Mandatory",
              "category",
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
        <MenuItem onClick={handleSettingsClose}>
          <ColumnIcon fontSize="small" sx={{ mr: 1 }} />
          Column Settings
        </MenuItem>
        <MenuItem onClick={handleSettingsClose}>
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
                  <Box component={action.icon} fontSize="small" sx={{ mr: 1 }} />
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
