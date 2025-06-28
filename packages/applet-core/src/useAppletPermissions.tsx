import React from 'react';

/**
 * Permission interface
 */
export interface Permission {
  key: string;
  label: string;
  hasAccess: boolean;
}

/**
 * Applet permission group interface
 */
export interface AppletPermissionGroup {
  id: string;
  label: string;
  icon?: React.ComponentType;
  permissions: Permission[];
}

/**
 * Configuration for a host applet
 */
export interface HostAppletConfig {
  id: string;
  label: string;
  routes: Array<{
    icon?: React.ComponentType;
    [key: string]: any;
  }>;
}

/**
 * Original applet with permissions
 */
export interface OriginalApplet {
  permissions?: Record<string, {
    id: string;
    name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

/**
 * Role configuration with permission mappings
 */
export interface RoleConfiguration {
  permissionMappings?: Record<string, Record<string, string[]>>;
  [key: string]: any;
}

/**
 * Props for the useAppletPermissions hook
 */
export interface UseAppletPermissionsProps {
  /** Host applet configurations */
  hostApplets: HostAppletConfig[];
  /** Role configuration with permission mappings */
  roleConfig: RoleConfiguration;
  /** Currently selected roles */
  selectedRoles: string[];
  /** Function to check if roles have permission */
  hasPermission: (roles: string[], appletId: string, permissionId: string) => boolean;
}

/**
 * Utility function to format permission names
 * Converts "VIEW_USERS" to "View Users"
 */
export function formatPermissionName(name: string): string {
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
}

/**
 * A hook that generates AppletPermissionGroup data by mapping host applets
 * to their original applet permissions and checking user access.
 * 
 * @example
 * ```tsx
 * const appletPermissions = useAppletPermissions({
 *   hostApplets: APPLETS,
 *   originalApplets: applets,
 *   roleConfig,
 *   selectedRoles,
 *   hasPermission: roleUtils.hasPermission,
 * });
 * ```
 */
export function useAppletPermissions({
  hostApplets,
  roleConfig,
  selectedRoles,
  hasPermission,
}: UseAppletPermissionsProps): AppletPermissionGroup[] {
  return React.useMemo(() => {
    return hostApplets.map((hostApplet) => {
      // Get permission mappings for this host applet
      const permissionMappings = roleConfig.permissionMappings?.[hostApplet.id];
      if (!permissionMappings) {
        console.warn(
          `No permission mappings found for host applet: ${hostApplet.id}`,
        );
        return null;
      }

      // Helper function to check if any selected role has the permission
      const hasAnyRolePermission = (appletId: string, permissionId: string): boolean => {
        return hasPermission(selectedRoles, appletId, permissionId);
      };

      // Convert permission mappings to permission checks
      const permissionChecks = Object.keys(permissionMappings).map((permissionId) => {
        // Extract permission name from ID (e.g., "user-management:view-users" -> "View Users")
        const permissionName = permissionId.split(':').pop() || permissionId;
        
        return {
          key: permissionId,
          label: formatPermissionName(permissionName),
          hasAccess: hasAnyRolePermission(hostApplet.id, permissionId),
        };
      });

      return {
        id: hostApplet.id,
        label: hostApplet.label,
        icon: hostApplet.routes[0]?.icon,
        permissions: permissionChecks,
      };
    }).filter(
      (applet): applet is NonNullable<typeof applet> => applet !== null,
    );
  }, [hostApplets, roleConfig, selectedRoles, hasPermission]);
}