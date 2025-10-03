import { useState, useCallback } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useHashNavigation } from "@smbc/applet-core";

// Simple filter specification with common field types
const filterSpec = {
  fields: [
    {
      name: "startDate",
      type: "date" as const,
      label: "Start Date",
    },
    {
      name: "endDate",
      type: "date" as const,
      label: "End Date",
    },
    {
      name: "search",
      type: "search" as const,
      label: "Search",
      placeholder: "Type to search...",
      fullWidth: true,
    },
    {
      name: "category",
      type: "select" as const,
      label: "Category",
      options: [
        { value: "", label: "All Categories" },
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
        { value: "books", label: "Books" },
      ],
    },
    {
      name: "status",
      type: "select" as const,
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ],
  initialValues: {
    search: "",
    category: "",
    status: "",
    startDate: "",
    endDate: "",
  },
  debounceMs: 300,
};

export default function FilterDemoApplet() {
  const [localFilters, setLocalFilters] = useState(filterSpec.initialValues);

  // Use hash navigation for URL synchronization
  const urlState = useHashNavigation({ autoParams: filterSpec.initialValues });

  // Handle filter changes with controlled pattern
  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      console.log("🔍 Filter change:", newFilters);
      setLocalFilters(newFilters);

      // Update URL to persist filter state
      if (urlState.setAutoParams) {
        urlState.setAutoParams((prev) => ({ ...prev, ...newFilters }));
      }
    },
    [urlState.setAutoParams],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Filter Demo Applet
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This simple demo showcases the Filter component usage with various field
        types and demonstrates URL synchronization patterns for maintaining
        filter state.
      </Typography>

      <Filter
        spec={filterSpec}
        values={localFilters}
        onFiltersChange={handleFiltersChange}
      />

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Filter Values:
        </Typography>
        <pre>{JSON.stringify(localFilters, null, 2)}</pre>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          URL Params:
        </Typography>
        <pre>{JSON.stringify(urlState.params, null, 2)}</pre>
      </Paper>
    </Box>
  );
}
