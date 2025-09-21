import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, Box } from "@mui/material";
import { ConfirmationDialog } from "@smbc/mui-components";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "Components/ConfirmationDialog",
  component: ConfirmationDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
    },
    confirmColor: {
      control: "select",
      options: ["primary", "secondary", "error", "warning", "info", "success"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to manage dialog state
const DialogWrapper = ({ ...args }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <ConfirmationDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          console.log("Confirmed!");
          setOpen(false);
        }}
      />
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Confirm Action",
    message: "Are you sure you want to proceed with this action?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmColor: "primary",
  },
};

