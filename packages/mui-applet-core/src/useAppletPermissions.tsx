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
  /** Original applets with permission definitions */
  originalApplets: OriginalApplet[];
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
  originalApplets,
  roleConfig,
  selectedRoles,
  hasPermission,
}: UseAppletPermissionsProps): AppletPermissionGroup[] {
  return React.useMemo(() => {
    return hostApplets.map((hostApplet) => {
      // Get the original applet from the config
      const originalApplet = originalApplets.find((applet) => {
        // Check if this applet has any permissions that match this host applet's permission mappings
        if (!applet.permissions) return false;

        // Look for permission mappings in roleConfig for this hostApplet.id
        const permissionMappings = roleConfig.permissionMappings?.[hostApplet.id];
        if (!permissionMappings) return false;

        // Check if any of the applet's permission IDs match the permission mappings
        const appletPermissionIds = Object.values(applet.permissions).map(
          (p: any) => p.id,
        );
        const mappingPermissionIds = Object.keys(permissionMappings);

        return appletPermissionIds.some((id) =>
          mappingPermissionIds.includes(id),
        );
      });

      if (!originalApplet || !originalApplet.permissions) {
        console.warn(
          `No applet with permissions found for host applet: ${hostApplet.id}`,
        );
        return null;
      }

      // Helper function to check if any selected role has the permission
      const hasAnyRolePermission = (appletId: string, permissionId: string): boolean => {
        return hasPermission(selectedRoles, appletId, permissionId);
      };

      // Convert permissions object to array of permission checks
      const permissionChecks = Object.entries(originalApplet.permissions).map(
        ([key, permission]) => ({
          key,
          label: formatPermissionName(permission.name),
          hasAccess: hasAnyRolePermission(hostApplet.id, permission.id),
        }),
      );

      return {
        id: hostApplet.id,
        label: hostApplet.label,
        icon: hostApplet.routes[0]?.icon,
        permissions: permissionChecks,
      };
    }).filter(
      (applet): applet is NonNullable<typeof applet> => applet !== null,
    );
  }, [hostApplets, originalApplets, roleConfig, selectedRoles, hasPermission]);
}