import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useHashParams } from "@smbc/applet-core";

export const FilteringRoute: React.FC = () => {
  const { filters: filterValues, setFilters: setFilterValues } = useHashParams(
    {
      search: "",
      status: "",
      priority: "",
      assignee: "",
      category: "",
    },
    {}, // No pagination needed for this demo
  );
  return (
    <Box sx={{ mt: 4 }}>
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
              type: "text",
              placeholder: "Enter assignee name",
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                { label: "All Categories", value: "" },
                { label: "Development", value: "dev" },
                { label: "Design", value: "design" },
                { label: "Marketing", value: "marketing" },
                { label: "Sales", value: "sales" },
              ],
            },
          ],
          initialValues: {
            search: "",
            status: "",
            priority: "",
            assignee: "",
            category: "",
          },
          title: "Demo Filters",
        }}
        onFiltersChange={setFilterValues}
        values={filterValues}
      />

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Filter Values:
          </Typography>
          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              color: (theme) =>
                theme.palette.mode === "dark" ? "grey.100" : "text.primary",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              overflow: "auto",
            }}
          >
            {JSON.stringify(filterValues, null, 2)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Notice how the URL hash updates as you change filter values
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🔍 How Filters Work in SMBC
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            URL Hash Synchronization
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Filters automatically sync with the URL hash using the{" "}
            <code>useHashParams</code> hook. This enables bookmarkable filter
            states and preserves user context across sessions.
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// Filter state management
const { filters, setFilters } = useHashParams({
  search: "",
  status: "",
  priority: ""
});

// URL updates automatically:
// #/applet/route?search=john&status=active`}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Filter Component Architecture
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>Declarative Configuration:</strong> Define filter fields
                with types, labels, and options
              </li>
              <li>
                <strong>Automatic UI Generation:</strong> The Filter component
                renders appropriate inputs
              </li>
              <li>
                <strong>Type Safety:</strong> TypeScript ensures filter values
                match their definitions
              </li>
              <li>
                <strong>Debounced Updates:</strong> Search fields wait for user
                to stop typing
              </li>
              <li>
                <strong>Clear All Function:</strong> Built-in reset to initial
                values
              </li>
            </ul>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Filter Field Types
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>search:</strong> Text input with search icon, full-width
                by default
              </li>
              <li>
                <strong>text:</strong> Standard text input for exact matches
              </li>
              <li>
                <strong>select:</strong> Dropdown with predefined options
              </li>
              <li>
                <strong>date:</strong> Date picker for temporal filtering
              </li>
              <li>
                <strong>number:</strong> Numeric input with validation
              </li>
              <li>
                <strong>boolean:</strong> Toggle switch for yes/no filters
              </li>
            </ul>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Integration with Data Views
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Filters seamlessly integrate with data views to provide real-time
            filtering:
          </Typography>

          <Typography
            component="pre"
            variant="body2"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {`// In DataView configuration
filters: {
  fields: [
    {
      name: "search",
      type: "search",
      label: "Search users",
      placeholder: "Name or email..."
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
      ]
    }
  ],
  transformFilters: (filters) => ({
    // Transform for API
    q: filters.search,
    is_active: filters.status === "active"
  })
}`}
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
            💡 Try changing filter values above and watch the URL update.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
