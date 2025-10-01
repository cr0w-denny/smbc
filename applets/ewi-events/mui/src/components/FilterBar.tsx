import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  MenuItem,
  MenuList,
} from "@mui/material";
import {
  Filter,
  AccountTree as WorkflowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@smbc/mui-components";
import { shadow } from "@smbc/ui-core";
import type { FilterSpec } from "@smbc/mui-components";

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

interface FilterBarProps {
  values: Record<string, any> & {
    dateFrom?: string;
    dateTo?: string;
    workflow?: string;
    types?: string[];
    plo?: string[];
    my?: boolean;
  };
  onValuesChange: (values: any) => void;
  onApply: () => void;
  filtersChanged?: boolean;
  workflowActions?: BulkAction[];
  selectedItems?: any[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  values,
  onValuesChange,
  onApply,
  filtersChanged = true,
  workflowActions = [],
  selectedItems = [],
}) => {
  const workflowButtonRef = React.useRef<HTMLButtonElement>(null);
  const [workflowAnchor, setWorkflowAnchor] = useState<null | HTMLElement>(
    null,
  );

  // Auto-open workflow dropdown when at least 2 items are selected
  React.useEffect(() => {
    if (selectedItems.length >= 2 && !workflowAnchor && workflowButtonRef.current) {
      setWorkflowAnchor(workflowButtonRef.current);
    }
  }, [selectedItems.length >= 2, workflowAnchor]);

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
  const filterSpec: FilterSpec = {
    debounceMs: 0, // Disable debouncing since we have apply button
    fields: [
      {
        name: "start_date",
        type: "date",
        label: "From",
      },
      {
        name: "end_date",
        type: "date",
        label: "To",
      },
      {
        name: "workflow",
        type: "select",
        label: "Status",
        options: [
          { label: "Any Status", value: "" },
          { label: "Subscribed", value: "Subscribed" },
          { label: "Not Subscribed", value: "NotSubscribed" },
          { label: "Review", value: "Review" },
          { label: "Approval", value: "Approval" },
          { label: "Complete", value: "Complete" },
        ],
      },
      {
        name: "types",
        type: "select",
        label: "Types",
        multiple: true,
        minWidth: 170,
        placeholder: "All Types",
        options: [
          { label: "ExRatings", value: "ExRatings" },
          { label: "Stock", value: "Stock" },
          { label: "CDS Spreads", value: "CDSSpreads" },
          { label: "Loan Prices", value: "LoanPrices" },
          { label: "Financials", value: "Financials" },
        ],
      },
      {
        name: "plo",
        type: "select",
        label: "PLO",
        multiple: true,
        minWidth: 170,
        placeholder: "All PLOs",
        options: [
          { label: "NYC001", value: "NYC001" },
          { label: "LAX002", value: "LAX002" },
          { label: "CHI003", value: "CHI003" },
          { label: "MIA004", value: "MIA004" },
          { label: "LON005", value: "LON005" },
          { label: "TKY006", value: "TKY006" },
          { label: "SIN007", value: "SIN007" },
        ],
      },
      {
        name: "my",
        type: "checkbox",
        label: "My Events",
      },
    ],
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
      <Filter
        spec={filterSpec}
        values={values}
        onFiltersChange={onValuesChange}
        sx={{ mt: 1, flex: 1 }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Updated on <br />
          9/18/25 9:00 AM
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => onApply()}
          disabled={!filtersChanged}
          sx={{
            minWidth: 100,
            "&.Mui-disabled": {
              border: "none",
            },
          }}
        >
          Refresh
        </Button>
      </Box>
      {workflowActions.length > 0 && (
        <Box>
          <Button
            ref={workflowButtonRef}
            variant="contained"
            startIcon={<WorkflowIcon />}
            endIcon={
              Boolean(workflowAnchor) ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={handleWorkflowClick}
            disabled={selectedItems.length < 2}
            sx={{
              "&.Mui-disabled": {
                outline: "none",
                border: "none",
              },
            }}
          >
            Workflow
          </Button>

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
                      action.onClick?.(selectedItems);
                      // Only close the menu if fewer than 2 items will likely remain
                      // (This is a heuristic since we don't know exactly what the action does)
                      if (selectedItems.length < 2) {
                        handleWorkflowClose();
                      }
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
      )}
    </Box>
  );
};
