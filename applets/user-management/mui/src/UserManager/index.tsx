import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions } from "@smbc/applet-core";
import { createUserManagerConfig } from "./config";
import permissions from "../permissions";

export interface UserManagerProps {
  /** Type of users to display */
  userType?: "all" | "admins" | "non-admins";
  /** Permission context for role-based access control */
  permissionContext?: string;
  /** Navigation handler for viewing user details */
  onViewUser?: (userId: string | number) => void;
}

/**
 * UserManager component for comprehensive user management
 *
 * Provides a complete user management interface with CRUD operations,
 * advanced filtering, sorting, pagination, and permission-based access control.
 * Much more than just a table - it's a full management interface.
 *
 * @example
 * ```tsx
 * // Display all users with full management capabilities
 * <UserManager />
 *
 * // Display only admin users
 * <UserManager userType="admins" />
 *
 * // Use custom permission context
 * <UserManager permissionContext="custom-context" />
 * ```
 */
export function UserManager({
  userType = "all",
  permissionContext = "user-management",
  onViewUser,
}: UserManagerProps) {
  // Get permissions for the current context
  const { hasPermission } = usePermissions();

  // Create the manager configuration
  const config = createUserManagerConfig({
    userType,
    permissions: {
      canCreate: hasPermission(permissionContext, permissions.CREATE_USERS),
      canEdit: hasPermission(permissionContext, permissions.EDIT_USERS),
      canDelete: hasPermission(permissionContext, permissions.DELETE_USERS),
    },
    handlers: {
      onViewUser: onViewUser ? (user: any) => onViewUser(user.id) : undefined,
    },
  });

  // Event handlers
  const handleSuccess = (_action: "create" | "edit" | "delete", _item?: any) => {
    // TODO: Add toast notification or snackbar
  };

  const handleError = (
    action: "create" | "edit" | "delete",
    error: any,
    item?: any,
  ) => {
    console.error(`Error: ${action}`, error, item);
    // TODO: Add error notification
  };

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext={permissionContext}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
