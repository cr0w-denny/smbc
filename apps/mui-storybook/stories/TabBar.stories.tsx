import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { TabBar, TabBarItem } from "@smbc/mui-components";

const meta: Meta<typeof TabBar> = {
  title: "Components/TabBar",
  component: TabBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    fullWidth: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const TabBarWrapper = ({
  items,
  initialValue,
  ...props
}: {
  items: TabBarItem[];
  initialValue?: string;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}) => {
  const [value, setValue] = useState(initialValue || items[0]?.value || "");

  return (
    <Box sx={{ width: props.fullWidth ? "100%" : "auto" }}>
      <TabBar
        items={items}
        value={value}
        onChange={setValue}
        {...props}
      />
      <Paper sx={{ mt: 3, p: 2, minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6">
          Active Tab: <strong>{value}</strong>
        </Typography>
      </Paper>
    </Box>
  );
};

export const Basic: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "overview", label: "Overview" },
        { value: "details", label: "Details" },
        { value: "settings", label: "Settings" },
      ]}
    />
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "dashboard", label: "Dashboard" },
        { value: "analytics", label: "Analytics" },
        { value: "reports", label: "Reports", disabled: true },
        { value: "settings", label: "Settings" },
      ]}
    />
  ),
};

export const Small: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]}
      size="small"
    />
  ),
};

export const Large: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "projects", label: "Projects" },
        { value: "team", label: "Team" },
        { value: "resources", label: "Resources" },
      ]}
      size="large"
    />
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <TabBarWrapper
        items={[
          { value: "home", label: "Home" },
          { value: "about", label: "About" },
          { value: "contact", label: "Contact" },
        ]}
        fullWidth
      />
    </Box>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "tab1", label: "Tab 1" },
        { value: "tab2", label: "Tab 2" },
        { value: "tab3", label: "Tab 3" },
        { value: "tab4", label: "Tab 4" },
        { value: "tab5", label: "Tab 5" },
        { value: "tab6", label: "Tab 6" },
      ]}
    />
  ),
};

export const LongLabels: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "user-management", label: "User Management" },
        { value: "system-configuration", label: "System Configuration" },
        { value: "reporting-analytics", label: "Reporting & Analytics" },
      ]}
    />
  ),
};

export const StatusTabs: Story = {
  render: () => (
    <TabBarWrapper
      items={[
        { value: "pending", label: "Pending (12)" },
        { value: "in-progress", label: "In Progress (5)" },
        { value: "completed", label: "Completed (23)" },
        { value: "cancelled", label: "Cancelled (3)" },
      ]}
      initialValue="in-progress"
    />
  ),
};

export const NavigationExample: Story = {
  render: () => (
    <Box sx={{ width: 500 }}>
      <Typography variant="h6" gutterBottom>
        Page Navigation
      </Typography>
      <TabBarWrapper
        items={[
          { value: "profile", label: "Profile" },
          { value: "security", label: "Security" },
          { value: "billing", label: "Billing" },
          { value: "notifications", label: "Notifications" },
          { value: "advanced", label: "Advanced", disabled: true },
        ]}
        fullWidth
        initialValue="security"
      />
    </Box>
  ),
};