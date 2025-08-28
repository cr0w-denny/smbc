import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import type { FilterSpec } from "@smbc/mui-components";

interface FilterBarProps {
  values: Record<string, any> & {
    dateFrom?: string;
    dateTo?: string;
    workflow?: string;
    types?: string;
  };
  onValuesChange: (values: any) => void;
  onApply: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  values,
  onValuesChange,
  onApply,
}) => {
  const filterSpec: FilterSpec = {
    fields: [
      {
        name: "dateFrom",
        type: "date",
        label: "From",
      },
      {
        name: "dateTo",
        type: "date",
        label: "To",
      },
      {
        name: "workflow",
        type: "select",
        label: "Workflow",
        options: [
          { label: "All Workflows", value: "" },
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
        options: [
          { label: "All Types", value: "" },
          { label: "ExRatings", value: "ExRatings" },
          { label: "Stock", value: "Stock" },
          { label: "CDS Spreads", value: "CDSSpreads" },
          { label: "Loan Prices", value: "LoanPrices" },
          { label: "Financials", value: "Financials" },
        ],
      },
    ],
  };

  return (
    <Box
      sx={{
        py: 1,
        mb: "100px",
        backgroundColor: "transparent", // Inherit gradient from app layout
      }}
    >
      {/* Max-width container for filter bar content */}
      <Box sx={{ maxWidth: "100%", mx: "auto" }}>
        {/* Filter component with Apply button on same line */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Filter
            spec={filterSpec}
            values={values}
            onFiltersChange={onValuesChange}
            sx={{ mb: 0, flex: 1 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onApply}
              sx={{ minWidth: 100 }}
            >
              Apply Filters
            </Button>
            <Typography variant="caption" color="text.secondary">
              Updated on {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
