import type { Meta, StoryObj } from "@storybook/react";
import { MenuItem } from "@mui/material";
import { CustomSelect } from "@smbc/mui-components";

const meta: Meta<typeof CustomSelect> = {
  title: "Components/CustomSelect",
  component: CustomSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "outlined", "standard"],
    },
    size: {
      control: "select",
      options: ["small", "medium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Select an option",
    children: [
      <MenuItem key="option1" value="option1">Option 1</MenuItem>,
      <MenuItem key="option2" value="option2">Option 2</MenuItem>,
      <MenuItem key="option3" value="option3">Option 3</MenuItem>,
    ],
  },
};

export const WithValue: Story = {
  args: {
    label: "Country",
    value: "us",
    children: [
      <MenuItem key="us" value="us">United States</MenuItem>,
      <MenuItem key="ca" value="ca">Canada</MenuItem>,
      <MenuItem key="uk" value="uk">United Kingdom</MenuItem>,
      <MenuItem key="de" value="de">Germany</MenuItem>,
      <MenuItem key="jp" value="jp">Japan</MenuItem>,
    ],
  },
};

export const Small: Story = {
  args: {
    label: "Size",
    size: "small",
    children: [
      <MenuItem key="xs" value="xs">Extra Small</MenuItem>,
      <MenuItem key="s" value="s">Small</MenuItem>,
      <MenuItem key="m" value="m">Medium</MenuItem>,
      <MenuItem key="l" value="l">Large</MenuItem>,
      <MenuItem key="xl" value="xl">Extra Large</MenuItem>,
    ],
  },
};

export const Outlined: Story = {
  args: {
    label: "Priority",
    variant: "outlined",
    children: [
      <MenuItem key="low" value="low">Low</MenuItem>,
      <MenuItem key="medium" value="medium">Medium</MenuItem>,
      <MenuItem key="high" value="high">High</MenuItem>,
      <MenuItem key="critical" value="critical">Critical</MenuItem>,
    ],
  },
};