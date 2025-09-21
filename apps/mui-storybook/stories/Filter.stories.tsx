import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography } from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useState } from "react";

const meta: Meta<typeof Filter> = {
  title: "Components/Filter",
  component: Filter,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A flexible filter component that supports various field types and real-time filtering.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const FilterWithState = ({ spec }: { spec: any }) => {
  const [filters, setFilters] = useState(spec.initialValues || {});

  return (
    <Box>
      <Filter spec={spec} values={filters} onFiltersChange={setFilters} />
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: "background.default",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Current Filter Values:
        </Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {JSON.stringify(filters, null, 2)}
        </Typography>
      </Box>
    </Box>
  );
};

export const BasicFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: "search",
            type: "search",
            label: "Search",
            placeholder: "Search items...",
            fullWidth: true,
          },
          {
            name: "category",
            type: "select",
            label: "Category",
            options: [
              { label: "All Categories", value: "" },
              { label: "Electronics", value: "electronics" },
              { label: "Clothing", value: "clothing" },
              { label: "Books", value: "books" },
            ],
          },
          {
            name: "active",
            type: "boolean",
            label: "Active Only",
          },
        ],
        initialValues: {
          search: "",
          category: "",
          active: false,
        },
        title: "Product Filters",
        showClearButton: true,
        showFilterCount: true,
      }}
    />
  ),
};

export const CollapsibleFilters: Story = {
  render: () => (
    <FilterWithState
      spec={{
        fields: [
          {
            name: "name",
            type: "text",
            label: "Name",
            placeholder: "Enter name...",
          },
          {
            name: "priority",
            type: "select",
            label: "Priority",
            options: [
              { label: "All Priorities", value: "" },
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ],
          },
          {
            name: "completed",
            type: "checkbox",
            label: "Completed Only",
          },
        ],
        initialValues: {
          name: "",
          priority: "",
          completed: false,
        },
        title: "Task Filters",
        collapsible: true,
        defaultCollapsed: true,
        showClearButton: true,
        showFilterCount: true,
      }}
    />
  ),
};
