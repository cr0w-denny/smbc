import { useState, useCallback, useEffect } from "react";

import { useApp } from "./AppContext";
import type { PermissionDefinition } from "./permissions";

// Hook for permission-based access control - for applets
export const usePermissions = () => {
  const { state, roleUtils } = useApp();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]]; // Default to first role (usually Guest)

  return {
    hasPermission: (appletId: string, permission: PermissionDefinition) =>
      roleUtils.hasPermission(userRoles, appletId, permission.id),
    hasAnyPermission: (appletId: string, permissions: PermissionDefinition[]) =>
      roleUtils.hasAnyPermission(userRoles, appletId, permissions.map(p => p.id)),
    hasAllPermissions: (appletId: string, permissions: PermissionDefinition[]) =>
      roleUtils.hasAllPermissions(userRoles, appletId, permissions.map(p => p.id)),
  };
};

/**
 * Custom hook for hash-based navigation with query parameter support
 * Provides clean URLs like #/path?param=value instead of #?route=path&param=value
 * 
 * @param mountPath Optional mount path for scoped navigation within applets
 * @returns Object with currentPath and navigateTo function
 * 
 * @example
 * // Global navigation (for host system)
 * const { currentPath, navigateTo } = useHashNavigation();
 * 
 * // Scoped navigation (for applets)
 * const { currentPath, navigateTo } = useHashNavigation("/user-management");
 */
export function useHashNavigation(mountPath?: string) {
  const [globalPath, setGlobalPath] = useState(() => {
    // Extract path from hash (e.g., "#/user-management?param=value" -> "/user-management")
    const hash = window.location.hash;
    if (!hash || hash === "#") return "/";

    const hashContent = hash.slice(1); // Remove the #
    const queryIndex = hashContent.indexOf("?");
    return queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
  });

  const globalNavigateTo = useCallback((path: string) => {
    // Navigate to the new path, resetting any existing query parameters
    window.location.hash = path;
    setGlobalPath(path);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === "#") {
        setGlobalPath("/");
        return;
      }

      const hashContent = hash.slice(1);
      const queryIndex = hashContent.indexOf("?");
      const path =
        queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
      setGlobalPath(path);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // If mountPath is provided, return scoped navigation
  if (mountPath) {
    const currentPath = globalPath.startsWith(mountPath) 
      ? globalPath.slice(mountPath.length) || '/'
      : '/';
    
    const navigateTo = useCallback((relativePath: string) => {
      const fullPath = relativePath === '/' 
        ? mountPath 
        : `${mountPath}${relativePath}`;
      globalNavigateTo(fullPath);
    }, [mountPath, globalNavigateTo]);
    
    return { currentPath, navigateTo };
  }

  // Default: return global navigation
  return { currentPath: globalPath, navigateTo: globalNavigateTo };
}

/**
 * Simple hook for managing URL query parameters with hash routing
 * Works with the current hash query string
 */
export function useHashQueryParams<T extends Record<string, any>>(
  defaultValues: T,
): [T, (updates: Partial<T>) => void] {
  const [params, setParams] = useState<T>(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");

    if (queryIndex === -1) {
      return { ...defaultValues };
    }

    const queryString = hash.slice(queryIndex + 1);
    const urlParams = new URLSearchParams(queryString);
    const result = { ...defaultValues };

    // Parse URL parameters and convert them to the correct types
    for (const [key, value] of urlParams.entries()) {
      if (key in defaultValues) {
        const defaultValue = defaultValues[key as keyof T];

        // Type conversion based on default value type
        if (typeof defaultValue === "boolean") {
          (result as any)[key] = value === "true";
        } else if (typeof defaultValue === "number") {
          const numValue = parseFloat(value);
          (result as any)[key] = isNaN(numValue) ? defaultValue : numValue;
        } else {
          (result as any)[key] = value;
        }
      }
    }

    return result;
  });

  const updateParams = useCallback(
    (updates: Partial<T>) => {
      setParams(currentParams => {
        const newParams = { ...currentParams, ...updates };

        // Update the hash with new query parameters, preserving the path
        const currentHash = window.location.hash;
        const queryIndex = currentHash.indexOf("?");
        const path =
          queryIndex >= 0
            ? currentHash.slice(1, queryIndex)
            : currentHash.slice(1) || "/";

        // Build new query string - only include values that differ from defaults
        const urlParams = new URLSearchParams();
        for (const [key, value] of Object.entries(newParams)) {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== defaultValues[key as keyof T]
          ) {
            urlParams.set(key, String(value));
          }
        }

        const queryString = urlParams.toString();
        const newHash = queryString ? `${path}?${queryString}` : path;
        window.location.hash = newHash;

        return newParams;
      });
    },
    [defaultValues],
  );

  // Listen for hash changes to sync state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const queryIndex = hash.indexOf("?");

      if (queryIndex === -1) {
        setParams({ ...defaultValues });
        return;
      }

      const queryString = hash.slice(queryIndex + 1);
      const urlParams = new URLSearchParams(queryString);
      const result = { ...defaultValues };

      for (const [key, value] of urlParams.entries()) {
        if (key in defaultValues) {
          const defaultValue = defaultValues[key as keyof T];

          if (typeof defaultValue === "boolean") {
            (result as any)[key] = value === "true";
          } else if (typeof defaultValue === "number") {
            const numValue = parseFloat(value);
            (result as any)[key] = isNaN(numValue) ? defaultValue : numValue;
          } else {
            (result as any)[key] = value;
          }
        }
      }

      setParams(result);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [defaultValues]);

  return [params, updateParams];
}


// Hook for user management
export const useUser = () => {
  const { state, actions, roleUtils } = useApp();

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    setUser: actions.setUser,
    setRoles: actions.setUserRoles,
    availableRoles: roleUtils.roles,
  };
};