import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { Permission as BasePermission, AppletPermissionGroup as BaseAppletPermissionGroup } from '@smbc/mui-applet-core';
export interface User {
    name?: string;
    email?: string;
}
export interface Permission extends BasePermission {
}
export interface AppletPermissionGroup extends Omit<BaseAppletPermissionGroup, 'icon'> {
    icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
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
    appletPermissions: AppletPermissionGroup[];
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
 * A comprehensive dashboard for visualizing and managing role-based permissions.
 *
 * Features:
 * - Interactive role selection with toggle buttons
 * - Real-time permission matrix showing access across applets
 * - Current user information display
 * - Responsive grid layout for permission cards
 * - Optional localStorage persistence for role selection
 * - Customizable applet groupings with icons
 */
export declare function RolePermissionDashboard({ user, availableRoles, selectedRoles, onRoleToggle, appletPermissions, title, showUserInfo, persistRoles, localStorageKey, }: RolePermissionDashboardProps): import("react/jsx-runtime").JSX.Element;
