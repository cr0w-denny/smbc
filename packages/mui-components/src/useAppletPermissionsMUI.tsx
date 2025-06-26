import { Person as PersonIcon } from '@mui/icons-material';
import { 
  useAppletPermissions as useBaseAppletPermissions,
  type UseAppletPermissionsProps as BaseUseAppletPermissionsProps,
} from '@smbc/mui-applet-core';
import type { AppletPermissionGroup } from './RolePermissionDashboard';

/**
 * Props for the MUI useAppletPermissions hook
 */
export interface UseAppletPermissionsProps extends BaseUseAppletPermissionsProps {}

/**
 * MUI-compatible wrapper for useAppletPermissions that converts icon types
 * and provides fallback icons
 */
export function useAppletPermissions(props: UseAppletPermissionsProps): AppletPermissionGroup[] {
  const basePermissions = useBaseAppletPermissions(props);
  
  // Convert the base permissions to MUI-compatible format
  return basePermissions.map((group): AppletPermissionGroup => ({
    ...group,
    // Cast icon to MUI type or provide fallback
    icon: (group.icon as any) || PersonIcon,
  }));
}