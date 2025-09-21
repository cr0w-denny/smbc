import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import type { FilterSpec } from "@smbc/mui-components";

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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  values,
  onValuesChange,
  onApply,
  filtersChanged = true,
}) => {
  const filterSpec: FilterSpec = {
    debounceMs: 0, // Disable debouncing since we have apply button
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
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
              backgroundColor: "action.disabledBackground",
            },
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
};
