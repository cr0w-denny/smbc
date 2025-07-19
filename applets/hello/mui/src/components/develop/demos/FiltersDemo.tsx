import React from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useHashParams } from "@smbc/applet-core";
import { CodeHighlight } from "../../CodeHighlight";

const CodeExample: React.FC = () => (
  <CodeHighlight
    language="tsx"
    code={`import { Filter } from "@smbc/mui-components";
import { useHashParams } from "@smbc/applet-core";

function MyFilterApplet() {
  const { state: filters, setState: setFilters } = useHashParams({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    category: ""
  });

  return (
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
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "All Categories", value: "" },
              { label: "Development", value: "dev" },
              { label: "Design", value: "design" },
              { label: "Marketing", value: "marketing" },
            ],
          },
        ],
        title: "Demo Filters",
      }}
      values={filters}
      onFiltersChange={setFilters}
    />
  );
}`}
  />
);

const LiveDemo: React.FC = () => {
  const { state: filterValues, setState: setFilterValues } = useHashParams({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    category: "",
  });

  return (
    <Box>
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
          <CodeHighlight
            language="json"
            showCopyButton={false}
            code={JSON.stringify(filterValues, null, 2)}
          />
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Notice how the URL hash updates as you change filter values
          </Typography>
        </CardContent>
      </Card>

      <Paper
        sx={{
          p: 2,
          mt: 2,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "info.900" : "info.50",
        }}
      >
        <Typography variant="subtitle2">Key Features:</Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
          <li>Multiple filter field types (search, select, text)</li>
          <li>Automatic URL hash synchronization</li>
          <li>Bookmarkable filter states</li>
          <li>Debounced search input</li>
          <li>Built-in clear all functionality</li>
          <li>TypeScript type safety</li>
        </Typography>
      </Paper>
    </Box>
  );
};

export const FiltersDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    { label: "Code", content: <CodeExample /> },
    { label: "Demo", content: <LiveDemo /> },
  ];

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>

      {tabs[activeTab]?.content}
    </Box>
  );
};
