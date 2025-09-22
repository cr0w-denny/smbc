import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { ChipToggleGroup, ChipToggleItem } from "@smbc/mui-components";

const meta: Meta<typeof ChipToggleGroup> = {
  title: "Components/ChipToggleGroup",
  component: ChipToggleGroup,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const ChipToggleWrapper = ({ chips }: { chips: ChipToggleItem[] }) => {
  const [activeValues, setActiveValues] = useState<string[]>([]);

  const handleChipToggle = (value: string, isActive: boolean) => {
    if (isActive) {
      setActiveValues(prev => [...prev, value]);
    } else {
      setActiveValues(prev => prev.filter(v => v !== value));
    }
  };

  return (
    <Box>
      <ChipToggleGroup
        chips={chips}
        activeValues={activeValues}
        onChipToggle={handleChipToggle}
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 1 }}>
        <strong>Active filters:</strong> {activeValues.length > 0 ? activeValues.join(", ") : "None"}
      </Box>
    </Box>
  );
};

export const Basic: Story = {
  render: () => (
    <ChipToggleWrapper
      chips={[
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "archived", label: "Archived" },
      ]}
    />
  ),
};

export const MutuallyExclusive: Story = {
  name: "Mutex",
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <ChipToggleWrapper
        chips={[
          { value: "low", label: "Low Priority", color: "#4CAF50", group: "priority" },
          { value: "medium", label: "Medium Priority", color: "#FF9800", group: "priority" },
          { value: "high", label: "High Priority", color: "#F44336", group: "priority" },
        ]}
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Priority group:</strong> Only one can be selected at a time (mutually exclusive).
        </Typography>
      </Box>
    </Box>
  ),
};

export const MultipleGroups: Story = {
  name: "Multi Mutex",
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>Status Filters with Icons & Counts</Typography>
      <ChipToggleWrapper
        chips={[
          // Lifecycle group (mutex)
          {
            value: "on-course",
            label: "On Course",
            count: 17,
            icon: <CheckIcon />,
            color: "#12A187",
            group: "lifecycle",
          },
          {
            value: "almost-due",
            label: "Almost Due",
            count: 12,
            icon: <CategoryIcon />,
            color: "#FD992E",
            group: "lifecycle",
          },
          {
            value: "past-due",
            label: "Past Due",
            count: 24,
            icon: <LocationIcon />,
            color: "#CD463C",
            group: "lifecycle",
          },

          // Type group (mutex)
          {
            value: "mandatory",
            label: "Mandatory",
            count: 22,
            icon: <StarIcon />,
            color: "#0066CC",
            group: "type",
          },
          {
            value: "discretionary",
            label: "Discretionary",
            count: 22,
            icon: <PersonIcon />,
            color: "#6B46C1",
            group: "type",
          },
        ]}
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Try selecting:</strong> One lifecycle status + one type. Each group is mutually exclusive within itself.
        </Typography>
      </Box>
    </Box>
  ),
};

export const WithCounts: Story = {
  render: () => (
    <ChipToggleWrapper
      chips={[
        { value: "all", label: "All Items", count: 156 },
        { value: "new", label: "New", count: 12 },
        { value: "in-progress", label: "In Progress", count: 34 },
        { value: "completed", label: "Completed", count: 89 },
      ]}
    />
  ),
};

