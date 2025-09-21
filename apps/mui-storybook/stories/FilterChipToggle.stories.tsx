import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Box } from "@mui/material";
import {
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { FilterChipToggle, FilterChip } from "@smbc/mui-components";

const meta: Meta<typeof FilterChipToggle> = {
  title: "Components/FilterChipToggle",
  component: FilterChipToggle,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const FilterChipWrapper = ({ chips }: { chips: FilterChip[] }) => {
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
      <FilterChipToggle
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
    <FilterChipWrapper
      chips={[
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "archived", label: "Archived" },
      ]}
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "users", label: "Users", icon: <PersonIcon />, color: "#1976D2" },
        { value: "categories", label: "Categories", icon: <CategoryIcon />, color: "#7B1FA2" },
        { value: "locations", label: "Locations", icon: <LocationIcon />, color: "#388E3C" },
        { value: "favorites", label: "Favorites", icon: <StarIcon />, color: "#F57C00" },
      ]}
    />
  ),
};

export const WithCounts: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "all", label: "All Items", count: 156, color: "#616161" },
        { value: "new", label: "New", count: 12, color: "#2196F3" },
        { value: "in-progress", label: "In Progress", count: 34, color: "#FF9800" },
        { value: "completed", label: "Completed", count: 89, color: "#4CAF50" },
        { value: "cancelled", label: "Cancelled", count: 21, color: "#F44336" },
      ]}
    />
  ),
};

export const StatusChips: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        {
          value: "on-course",
          label: "On Course",
          count: 17,
          icon: <CheckIcon />,
          color: "#12A187",
        },
        {
          value: "almost-due",
          label: "Almost Due",
          count: 12,
          icon: <CategoryIcon />,
          color: "#FD992E",
        },
        {
          value: "past-due",
          label: "Past Due",
          count: 24,
          icon: <LocationIcon />,
          color: "#CD463C",
        },
        {
          value: "mandatory",
          label: "Mandatory",
          count: 22,
          icon: <StarIcon />,
          color: "#0066CC",
        },
        {
          value: "discretionary",
          label: "Discretionary",
          count: 22,
          icon: <PersonIcon />,
          color: "#6B46C1",
        },
      ]}
    />
  ),
};

export const WithDisabledChips: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "available", label: "Available", count: 45, color: "#4CAF50" },
        { value: "maintenance", label: "Under Maintenance", count: 0, disabled: true, color: "#9E9E9E" },
        { value: "assigned", label: "Assigned", count: 23, color: "#2196F3" },
        { value: "offline", label: "Offline", count: 0, disabled: true, color: "#9E9E9E" },
      ]}
    />
  ),
};

