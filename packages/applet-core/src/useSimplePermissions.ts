import { useApp } from "./AppContext";

/**
 * Simplified permission hook that works with flat permission lists
 * 
 * This replaces the complex role-based permission system with a simple
 * list of permission strings that the user has access to.
 * 
 * @example
 * ```tsx
 * const { hasPermission } = useSimplePermissions();
 * 
 * if (!hasPermission("user-management:VIEW_USERS")) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export function useSimplePermissions() {
  const { state } = useApp();
  
  // Get user permissions - this could come from:
  // 1. Converted from roles (current approach)
  // 2. Direct from API (future approach)
  // 3. Injected by app (flexible approach)
  const userPermissions = state.user?.permissions || [];
  
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };
  
  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}