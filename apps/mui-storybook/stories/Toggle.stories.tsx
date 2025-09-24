import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Stack,
  FormGroup,
  Divider,
} from "@mui/material";

const meta: Meta = {
  title: "Components/Toggle",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state
const ToggleWrapper = ({ label, defaultChecked = false, disabled = false }: { label: string; defaultChecked?: boolean; disabled?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          disabled={disabled}
        />
      }
      label={label}
    />
  );
};

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Basic Toggles
        </Typography>
        <FormGroup>
          <ToggleWrapper label="Toggle Option" />
          <ToggleWrapper label="Enabled by Default" defaultChecked />
          <ToggleWrapper label="Disabled Toggle" disabled />
          <ToggleWrapper label="Disabled Checked" defaultChecked disabled />
        </FormGroup>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Toggle Sizes
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <FormControlLabel control={<Switch size="small" />} label="Small" />
          <FormControlLabel
            control={<Switch size="medium" />}
            label="Medium (Default)"
          />
        </Stack>
      </Box>
    </Stack>
  ),
};
