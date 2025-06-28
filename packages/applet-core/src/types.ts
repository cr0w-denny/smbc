import { PermissionDefinition } from "./permissions";

// Role configuration types
export interface RoleConfig {
  roles: string[];
  permissionMappings?: Record<string, Record<string, string[]>>;
}

// Permission mapping for applets
export interface PermissionMapping {
  [appletId: string]: {
    [permission: string]: string[]; // Which roles have this permission
  };
}

// Minimal User interface - only essential properties
export interface User {
  id: string;
  roles: string[]; // Multiple roles (e.g., ['Customer', 'Manager'])
  name: string;
  email?: string; // Optional for display purposes
  avatar?: string; // Optional for display purposes
  [key: string]: any; // Allow extending with additional properties as needed
}

// Extended User preferences - can be used optionally
export interface UserPreferences {
  theme?: "light" | "dark" | "auto";
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
  };
  [key: string]: any; // Allow extending with additional preferences
}

// Extended User interface with preferences (for apps that need them)
export interface UserWithPreferences extends User {
  preferences: UserPreferences;
}

// Navigation item interface
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  path?: string;
  external?: boolean;
  children?: NavigationItem[];
  requiredRoles?: string[]; // Role names that can access this item
  requiredPermissions?: string[]; // Permissions needed for this item
  appletId?: string; // For permission mapping
  badge?: string | number;
  divider?: boolean;
}

// Simplified app state interface - only essential properties
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  navigation: NavigationItem[];
  appletRegistry?: Record<string, any>;
}

// Applet system types
export interface AppletRoute {
  path: string; // Must include '/' as root route
  label: string; // Display name for menus
  component: React.ComponentType; // React component to render
}

// Standard applet permissions (re-using PermissionDefinition from appletPermissions)
export interface AppletPermissions {
  [key: string]: PermissionDefinition;
}

// Generic applet definition that preserves permission key types
export interface Applet<
  TPermissions extends AppletPermissions = AppletPermissions,
> {
  readonly permissions: TPermissions;
  readonly routes: readonly AppletRoute[];
  readonly apiSpec?: {
    name: string;
    spec: any; // OpenAPI 3.0 spec object
  };
}

// Host applet types for mounting applets in host applications
export interface HostAppletRoute {
  path: string;
  label: string;
  component: any;
  icon?: any;
  requiredPermissions?: string[];
}

export interface HostAppletDefinition {
  id: string;
  label: string;
  routes: HostAppletRoute[];
  apiSpec?: {
    name: string;
    spec: any;
  };
}

// Utility functions for role management
export const createRoleUtilities = (
  roles: string[],
  permissionMappings?: PermissionMapping,
) => {
  // Create role-to-bitflag mapping
  const roleToBitflag: Record<string, number> = {};
  const bitflagToRole: Record<number, string> = {};

  roles.forEach((role, index) => {
    const bitflag = index === 0 ? 0 : 1 << (index - 1); // First role is 0 (guest), others are bitflags
    roleToBitflag[role] = bitflag;
    bitflagToRole[bitflag] = role;
  });

  const getRoleBitflag = (roleName: string): number => {
    return roleToBitflag[roleName] ?? 0;
  };

  const hasRole = (userRoles: string[], requiredRoles: string[]): boolean => {
    return requiredRoles.some((role) => userRoles.includes(role));
  };

  // Build accumulated permission set from all user roles
  const getUserPermissions = (
    userRoles: string[],
    appletId: string,
  ): Set<string> => {
    const permissions = new Set<string>();

    if (!permissionMappings || !permissionMappings[appletId]) {
      return permissions;
    }

    const appletPermissions = permissionMappings[appletId];

    // For each permission in the applet
    Object.entries(appletPermissions).forEach(([permission, allowedRoles]) => {
      // Check if any of the user's roles grants this permission
      if (userRoles.some((userRole) => allowedRoles.includes(userRole))) {
        permissions.add(permission);
      }
    });

    return permissions;
  };

  const hasPermission = (
    userRoles: string[],
    appletId: string,
    permission: string,
  ): boolean => {
    const userPermissions = getUserPermissions(userRoles, appletId);
    return userPermissions.has(permission);
  };

  const hasAnyPermission = (
    userRoles: string[],
    appletId: string,
    permissions: string[],
  ): boolean => {
    const userPermissions = getUserPermissions(userRoles, appletId);
    return permissions.some((permission) => userPermissions.has(permission));
  };

  const hasAllPermissions = (
    userRoles: string[],
    appletId: string,
    permissions: string[],
  ): boolean => {
    const userPermissions = getUserPermissions(userRoles, appletId);
    return permissions.every((permission) => userPermissions.has(permission));
  };

  // For navigation items that need bitflag-based access control
  const createRoleBitflag = (roleNames: string[]): number => {
    return roleNames.reduce((bitflag, roleName) => {
      return bitflag | getRoleBitflag(roleName);
    }, 0);
  };

  const hasRoleBitflag = (
    userRole: string,
    requiredBitflag: number,
  ): boolean => {
    const userBitflag = getRoleBitflag(userRole);
    return (userBitflag & requiredBitflag) !== 0;
  };

  return {
    roles,
    roleToBitflag,
    bitflagToRole,
    getRoleBitflag,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    createRoleBitflag,
    hasRoleBitflag,
  };
};