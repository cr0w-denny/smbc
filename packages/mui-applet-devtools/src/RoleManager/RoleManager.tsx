import { Box } from "@mui/material";
import {
  DashboardHeader,
  CurrentUserInfo,
  PermissionsGrid,
  type User,
  type PermissionGroup,
} from ".";
import { useLocalStoragePersistence } from "@smbc/applet-core";

export interface RoleManagerProps {
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

/**
 * A complete role management feature that handles state and orchestrates
 * pure UI components for role-based permission management.
 *
 * Features:
 * - Interactive role selection with toggle buttons
 * - Real-time permission matrix showing access across applets
 * - Current user information display
 * - Responsive grid layout for permission cards
 * - Optional localStorage persistence for role selection
 * - Customizable applet groupings with icons
 */
export function RoleManager({
  user,
  availableRoles,
  selectedRoles,
  onRoleToggle,
  appletPermissions,
  title = "Role & Permissions",
  showUserInfo = true,
  persistRoles = true,
  localStorageKey = "roleManagement-selectedRoles",
}: RoleManagerProps) {
  useLocalStoragePersistence({
    selectedRoles,
    persistRoles,
    localStorageKey,
  });

  return (
    <Box sx={{ p: 3 }}>
      <DashboardHeader
        title={title}
        availableRoles={availableRoles}
        selectedRoles={selectedRoles}
        onRoleToggle={onRoleToggle}
      />

      {user && (
        <CurrentUserInfo
          user={user}
          selectedRoles={selectedRoles}
          show={showUserInfo}
        />
      )}

      <PermissionsGrid appletPermissions={appletPermissions} />
    </Box>
  );
}
