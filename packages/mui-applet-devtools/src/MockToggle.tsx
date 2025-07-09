import { Switch } from '@mui/material';
import { useFeatureFlag, useFeatureFlagToggle } from '@smbc/applet-core';

export interface MockToggleProps {
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
  size = "small",
  color = "default",
  sx,
}: MockToggleProps) {
  const mockEnabled = useFeatureFlag("mockData");
  const toggleMockData = useFeatureFlagToggle("mockData");

  return (
    <Switch
      checked={Boolean(mockEnabled)}
      onChange={toggleMockData}
      color={color}
      size={size}
      sx={{ color: 'inherit', ...sx }}
    />
  );
}