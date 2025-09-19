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
      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
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
        { value: "users", label: "Users", icon: <PersonIcon /> },
        { value: "categories", label: "Categories", icon: <CategoryIcon /> },
        { value: "locations", label: "Locations", icon: <LocationIcon /> },
        { value: "favorites", label: "Favorites", icon: <StarIcon /> },
      ]}
    />
  ),
};

export const WithCounts: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "all", label: "All Items", count: 156 },
        { value: "new", label: "New", count: 12 },
        { value: "in-progress", label: "In Progress", count: 34 },
        { value: "completed", label: "Completed", count: 89 },
        { value: "cancelled", label: "Cancelled", count: 21 },
      ]}
    />
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        {
          value: "high-priority",
          label: "High Priority",
          count: 5,
          style: {
            border: "#d32f2f",
            badge: "#d32f2f",
            fill: "#ffebee",
          },
        },
        {
          value: "medium-priority",
          label: "Medium Priority",
          count: 23,
          style: {
            border: "#ed6c02",
            badge: "#ed6c02",
            fill: "#fff3e0",
          },
        },
        {
          value: "low-priority",
          label: "Low Priority",
          count: 45,
          style: {
            border: "#2e7d32",
            badge: "#2e7d32",
            fill: "#e8f5e8",
          },
        },
      ]}
    />
  ),
};

export const WithDisabledChips: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "available", label: "Available", count: 45 },
        { value: "maintenance", label: "Under Maintenance", count: 0, disabled: true },
        { value: "assigned", label: "Assigned", count: 23 },
        { value: "offline", label: "Offline", count: 0, disabled: true },
      ]}
    />
  ),
};

export const LargeSet: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        { value: "javascript", label: "JavaScript", count: 42 },
        { value: "typescript", label: "TypeScript", count: 38 },
        { value: "react", label: "React", count: 35 },
        { value: "vue", label: "Vue.js", count: 12 },
        { value: "angular", label: "Angular", count: 8 },
        { value: "nodejs", label: "Node.js", count: 25 },
        { value: "python", label: "Python", count: 31 },
        { value: "java", label: "Java", count: 18 },
        { value: "csharp", label: "C#", count: 14 },
        { value: "go", label: "Go", count: 9 },
        { value: "rust", label: "Rust", count: 6 },
        { value: "php", label: "PHP", count: 15 },
      ]}
    />
  ),
};

export const WithIconsAndCounts: Story = {
  render: () => (
    <FilterChipWrapper
      chips={[
        {
          value: "verified",
          label: "Verified",
          icon: <CheckIcon />,
          count: 89,
          style: {
            border: "#2e7d32",
            badge: "#2e7d32",
            fill: "#e8f5e8",
          },
        },
        {
          value: "users",
          label: "Users",
          icon: <PersonIcon />,
          count: 156,
        },
        {
          value: "locations",
          label: "Locations",
          icon: <LocationIcon />,
          count: 23,
        },
        {
          value: "favorites",
          label: "Favorites",
          icon: <StarIcon />,
          count: 12,
          style: {
            border: "#ed6c02",
            badge: "#ed6c02",
            fill: "#fff3e0",
          },
        },
      ]}
    />
  ),
};