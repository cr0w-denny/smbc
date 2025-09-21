import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import { DarkModeSwitch } from "@smbc/mui-components";

const meta: Meta<typeof DarkModeSwitch> = {
  title: "Components/DarkModeSwitch",
  component: DarkModeSwitch,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether dark mode is enabled",
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    showLabel: {
      control: "boolean",
      description: "Whether to show the mode label",
    },
    labelPlacement: {
      control: "select",
      options: ["start", "end", "top", "bottom"],
      description: "Label placement relative to the switch",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state
const DarkModeSwitchWrapper = ({ defaultChecked = false, ...props }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <DarkModeSwitch
      checked={checked}
      onChange={setChecked}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <DarkModeSwitchWrapper />,
};

export const WithoutLabel: Story = {
  render: () => <DarkModeSwitchWrapper showLabel={false} />,
};

