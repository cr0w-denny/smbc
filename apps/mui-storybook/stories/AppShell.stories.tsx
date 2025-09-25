import type { Meta, StoryObj } from "@storybook/react";
import { Paper, Typography } from "@mui/material";
import { AppShell, Logo } from "@smbc/mui-components";
import { Box } from "@mui/material";

const meta: Meta<typeof AppShell.Layout> = {
  title: "Components/AppShell",
  component: AppShell.Layout,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof AppShell.Layout>;

export const Default: Story = {
  args: {
    logo: <Logo height={60} variant="dark" />,
    navigation: [
      { label: "Events Dashboard", type: "link", href: "/events" },
      { label: "Obligor Dashboard", type: "link", href: "/obligor" },
      { label: "Subscription", type: "link", href: "/subscription" },
      {
        label: "Reporting",
        type: "dropdown",
        items: [
          { label: "Monthly Reports", href: "/reports/monthly" },
          { label: "Annual Reports", href: "/reports/annual" },
          { label: "Custom Reports", href: "/reports/custom" },
        ],
      },
      { label: "Quick Guide", type: "button", color: "primary" },
    ],
    children: (
      <Box sx={{ mt: 16, mx: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a page from the navigation to get started.
          </Typography>
        </Paper>
      </Box>
    ),
  },
};
