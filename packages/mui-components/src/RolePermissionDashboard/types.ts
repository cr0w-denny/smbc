import type { SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";

export interface User {
  name?: string;
  email?: string;
}

// Pure UI types with no applet dependencies
export interface Permission {
  key: string;
  label: string;
  hasAccess: boolean;
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
}

export interface RolePermissionDashboardProps {
  /** Current user information */
  user?: User;
  /** Available roles that can be selected */
  availableRoles: string[];
  /** Currently active/selected roles */
  selectedRoles: string[];
  /** Function called when roles are toggled */
  onRoleToggle: (role: string) => void;
  /** Applet permission groups to display */
  appletPermissions: PermissionGroup[];
  /** Optional title for the dashboard */
  title?: string;
  /** Whether to show the current user info section */
  showUserInfo?: boolean;
  /** Whether to persist selected roles to localStorage */
  persistRoles?: boolean;
  /** LocalStorage key for persisting roles */
  localStorageKey?: string;
}
