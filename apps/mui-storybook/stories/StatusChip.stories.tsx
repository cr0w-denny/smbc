import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@mui/material";
import { StatusChip } from "@smbc/mui-components";

const meta: Meta<typeof StatusChip> = {
  title: "Components/StatusChip",
  component: StatusChip,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error", "warning", "success", "info", "custom"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <StatusChip variant="default" label="Default" />
      <StatusChip variant="error" label="Error" />
      <StatusChip variant="warning" label="Warning" />
      <StatusChip variant="success" label="Success" />
      <StatusChip variant="info" label="Info" />
    </Stack>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <StatusChip
        variant="custom"
        label="Custom Purple"
        outlineColor="#8B5CF6"
        fillColor="#F3E8FF"
        textColor="#8B5CF6"
      />
      <StatusChip
        variant="custom"
        label="Custom Teal"
        outlineColor="#14B8A6"
        fillColor="#F0FDFA"
        textColor="#14B8A6"
      />
    </Stack>
  ),
};