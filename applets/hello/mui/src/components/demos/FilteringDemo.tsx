import React from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useHashParams } from "@smbc/applet-core";

export const FilteringDemo: React.FC = () => {
  const { filters: filterValues, setFilters: setFilterValues } = useHashParams({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    category: "",
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🔍 Smart Filtering with URL Persistence
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This demonstrates automatic filter persistence in the URL. Try
          changing filters and notice how the URL updates. Refresh the page -
          your filters are preserved!
        </Typography>
      </Alert>

      <Filter
        spec={{
          fields: [
            {
              name: "search",
              label: "Search",
              type: "search",
              placeholder: "Search anything...",
              fullWidth: true,
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { label: "All", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Pending", value: "pending" },
              ],
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              options: [
                { label: "Any", value: "" },
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
              ],
            },
            {
              name: "assignee",
              label: "Assignee",
              type: "select",
              options: [
                { label: "Anyone", value: "" },
                { label: "John Smith", value: "john" },
                { label: "Jane Doe", value: "jane" },
                { label: "Bob Wilson", value: "bob" },
              ],
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                { label: "All Categories", value: "" },
                { label: "Bug", value: "bug" },
                { label: "Feature", value: "feature" },
                { label: "Enhancement", value: "enhancement" },
                { label: "Documentation", value: "docs" },
              ],
            },
          ],
        }}
        values={filterValues}
        onFiltersChange={setFilterValues}
      />

      <Paper sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Current Filter State:
        </Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
            color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          {JSON.stringify(filterValues, null, 2)}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          This state is automatically synchronized with the URL hash parameters
          and persists across page refreshes.
        </Typography>
      </Paper>

      <Paper sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          🔧 Technical Implementation
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This filtering system demonstrates several key applet capabilities:
        </Typography>
        <Typography component="ul" variant="body2" sx={{ pl: 2 }}>
          <li>
            <strong>URL State Persistence:</strong> Filter values are stored in
            URL hash parameters
          </li>
          <li>
            <strong>Automatic Serialization:</strong> Complex objects are
            serialized/deserialized automatically
          </li>
          <li>
            <strong>Deep Linking:</strong> Share URLs with specific filter
            states
          </li>
          <li>
            <strong>Browser Integration:</strong> Back/forward buttons work with
            filter changes
          </li>
          <li>
            <strong>Component Reusability:</strong> The Filter component can be
            configured for any data schema
          </li>
        </Typography>
      </Paper>
    </Box>
  );
};
