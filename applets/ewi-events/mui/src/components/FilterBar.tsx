import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import type { FilterSpec } from "@smbc/mui-components";

interface FilterBarProps {
  values: Record<string, any> & {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    exRatings?: string;
    workflow?: string;
    priority?: string;
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
        name: "exRatings",
        type: "text",
        label: "ExRatings",
      },
      {
        name: "workflow",
        type: "select",
        label: "Workflow",
        options: [
          { label: "All", value: "" },
          { label: "1 LOD Review", value: "1LOD" },
          { label: "2 LOD Review", value: "2LOD" },
          { label: "1 LOD Analyst", value: "Analyst" },
        ],
      },
      {
        name: "priority",
        type: "select",
        label: "Priority Level",
        options: [
          { label: "All Priorities", value: "" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
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
