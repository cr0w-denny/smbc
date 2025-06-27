import { useState, useCallback, useEffect } from "react";

import { useApp } from "./AppContext";

// Hook for permission-based access control - for applets
export const usePermissions = () => {
  const { state, roleUtils } = useApp();
  const userRoles = state.user?.roles ?? [roleUtils.roles[0]]; // Default to first role (usually Guest)

  return {
    hasPermission: (appletId: string, permission: string) =>
      roleUtils.hasPermission(userRoles, appletId, permission),
    hasAnyPermission: (appletId: string, permissions: string[]) =>
      roleUtils.hasAnyPermission(userRoles, appletId, permissions),
    hasAllPermissions: (appletId: string, permissions: string[]) =>
      roleUtils.hasAllPermissions(userRoles, appletId, permissions),
  };
};

/**
 * Custom hook for hash-based navigation with query parameter support
 * Provides clean URLs like #/path?param=value instead of #?route=path&param=value
 */
export function useHashNavigation() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Extract path from hash (e.g., "#/user-management?param=value" -> "/user-management")
    const hash = window.location.hash;
    if (!hash || hash === "#") return "/";

    const hashContent = hash.slice(1); // Remove the #
    const queryIndex = hashContent.indexOf("?");
    return queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
  });

  const navigateTo = useCallback((path: string) => {
    // Navigate to the new path, resetting any existing query parameters
    window.location.hash = path;
    setCurrentPath(path);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === "#") {
        setCurrentPath("/");
        return;
      }

      const hashContent = hash.slice(1);
      const queryIndex = hashContent.indexOf("?");
      const path =
        queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
      setCurrentPath(path);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return { currentPath, navigateTo };
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
      const newParams = { ...params, ...updates };
      setParams(newParams);

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
    },
    [params],
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


// Hook for sidebar management (simplified - components should manage their own state)
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    toggle: () => setIsOpen(!isOpen),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};

// Hook for notifications (simplified - returns empty state since not implemented)
export const useNotifications = () => {
  return {
    notifications: [],
    unreadCount: 0,
    addNotification: () => console.warn("Notifications not implemented"),
    removeNotification: () => console.warn("Notifications not implemented"),
    markAsRead: () => console.warn("Notifications not implemented"),
    clearAll: () => console.warn("Notifications not implemented"),
  };
};

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