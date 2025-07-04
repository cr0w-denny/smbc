import { Switch, FormControlLabel } from '@mui/material';
import { useFeatureFlag, useFeatureFlagToggle } from '@smbc/applet-core';

export interface MockToggleProps {
  /** Custom label for the toggle */
  label?: string;
  /** Size of the switch */
  size?: 'small' | 'medium';
  /** Color of the switch */
  color?: 'default' | 'primary' | 'secondary';
  /** Additional sx props */
  sx?: any;
}

/**
 * Toggle component for enabling/disabling mock data
 * Manages the 'mockData' feature flag
 */
export function MockToggle({
  label = "Mock",
  size = "small",
  color = "default",
  sx,
}: MockToggleProps) {
  const mockEnabled = useFeatureFlag("mockData");
  const toggleMockData = useFeatureFlagToggle("mockData");

  return (
    <FormControlLabel
      control={
        <Switch
          checked={Boolean(mockEnabled)}
          onChange={toggleMockData}
          color={color}
          size={size}
        />
      }
      label={label}
      sx={{ color: 'inherit', ...sx }}
    />
  );
}