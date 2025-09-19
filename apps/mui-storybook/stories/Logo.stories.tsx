import type { Meta, StoryObj } from "@storybook/react";
import { Box, Paper } from "@mui/material";
import { Logo } from "@smbc/mui-components";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    height: {
      control: { type: "range", min: 16, max: 128, step: 8 },
    },
    variant: {
      control: "select",
      options: ["auto", "light", "dark"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    height: 32,
    variant: "auto",
  },
};

export const Small: Story = {
  args: {
    height: 24,
    variant: "auto",
  },
};

export const Large: Story = {
  args: {
    height: 64,
    variant: "auto",
  },
};

export const ExtraLarge: Story = {
  args: {
    height: 96,
    variant: "auto",
  },
};

export const LightVariant: Story = {
  args: {
    height: 48,
    variant: "light",
  },
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, bgcolor: "grey.900" }}>
        <Story />
      </Paper>
    ),
  ],
};

export const DarkVariant: Story = {
  args: {
    height: 48,
    variant: "dark",
  },
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, bgcolor: "grey.100" }}>
        <Story />
      </Paper>
    ),
  ],
};

export const ResponsiveSizes: Story = {
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <Logo height={16} />
      <Logo height={24} />
      <Logo height={32} />
      <Logo height={48} />
      <Logo height={64} />
    </Box>
  ),
};