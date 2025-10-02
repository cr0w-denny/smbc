import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  Filter,
  ActionMenu,
  AccountTree as WorkflowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@smbc/mui-components";
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
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
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
        <ActionMenu
          trigger={
            <Button
              variant="contained"
              startIcon={<WorkflowIcon />}
              endIcon={
                workflowMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
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
          }
          menuItems={workflowActions.map((action) => ({
            label: action.label,
            icon: action.icon ? <Box component={action.icon} fontSize="small" /> : undefined,
            onClick: () => action.onClick?.(selectedItems),
            disabled: action.disabled?.(selectedItems),
          }))}
          onMenuOpen={() => setWorkflowMenuOpen(true)}
          onMenuClose={() => setWorkflowMenuOpen(false)}
        />
      )}
    </Box>
  );
};
