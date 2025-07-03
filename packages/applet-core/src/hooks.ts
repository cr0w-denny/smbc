import React, { useState, useCallback, useEffect, useRef } from "react";

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
      roleUtils.hasAnyPermission(
        userRoles,
        appletId,
        permissions.map((p) => p.id),
      ),
    hasAllPermissions: (
      appletId: string,
      permissions: PermissionDefinition[],
    ) =>
      roleUtils.hasAllPermissions(
        userRoles,
        appletId,
        permissions.map((p) => p.id),
      ),
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
        setGlobalPath((prev) => prev === "/" ? prev : "/");
        return;
      }

      const hashContent = hash.slice(1);
      const queryIndex = hashContent.indexOf("?");
      const path =
        queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
      
      // Only update state if the path actually changed
      setGlobalPath((prev) => prev === path ? prev : path);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // If mountPath is provided, return scoped navigation
  if (mountPath) {
    const currentPath = globalPath.startsWith(mountPath)
      ? globalPath.slice(mountPath.length) || "/"
      : "/";

    const navigateTo = useCallback(
      (relativePath: string) => {
        const fullPath =
          relativePath === "/" ? mountPath : `${mountPath}${relativePath}`;
        globalNavigateTo(fullPath);
      },
      [mountPath, globalNavigateTo],
    );

    return { currentPath, navigateTo };
  }

  // Default: return global navigation
  return { currentPath: globalPath, navigateTo: globalNavigateTo };
}


/**
 * Write-only URL hash synchronization hook (client-side routing format: #/path?param1=x&...)
 * 
 * Pattern:
 * - Read hash params ONLY on initial mount to set initial state
 * - From then on, hash is write-only reflection of state
 * - Never read from hash after initial mount to avoid re-render loops
 * - Preserves existing path and merges params instead of replacing
 */
export function useHashParams<
  TFilters extends Record<string, any>,
  TPagination extends Record<string, any>,
>(
  defaultFilters: TFilters,
  defaultPagination: TPagination,
  enabled: boolean = true,
  namespace?: string,
): {
  filters: TFilters;
  setFilters: (
    updates: Partial<TFilters> | ((prev: TFilters) => TFilters),
  ) => void;
  pagination: TPagination;
  setPagination: (
    updates: Partial<TPagination> | ((prev: TPagination) => TPagination),
  ) => void;
} {
  // Memoize default values to prevent unnecessary re-renders
  const stableDefaultFilters = React.useMemo(() => defaultFilters, [JSON.stringify(defaultFilters)]);
  const stableDefaultPagination = React.useMemo(() => defaultPagination, [JSON.stringify(defaultPagination)]);
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  
  // Track current state with refs to avoid unnecessary re-renders
  const currentFilters = useRef<TFilters>(defaultFilters);
  const currentPagination = useRef<TPagination>(defaultPagination);
  


  // Helper to parse current hash params
  const parseHashParams = useCallback(() => {
    if (!enabled || typeof window === "undefined")
      return { filters: {}, pagination: {} };

    try {
      const hash = window.location.hash.slice(1); // Remove #
      if (!hash) return { filters: {}, pagination: {} };

      // Split path and query params: "/path?param1=x&..." -> ["/path", "param1=x&..."]
      const [, queryString] = hash.split("?");
      if (!queryString) return { filters: {}, pagination: {} };

      const params = new URLSearchParams(queryString);
      const filters: Record<string, any> = {};
      const pagination: Record<string, any> = {};

      for (const [key, value] of params.entries()) {
        // Remove namespace prefix if present
        const cleanKey =
          namespace && key.startsWith(`${namespace}_`)
            ? key.replace(`${namespace}_`, "")
            : key;

        // Skip if this param has a namespace but it's not ours
        if (
          namespace &&
          key.includes("_") &&
          !key.startsWith(`${namespace}_`)
        ) {
          continue;
        }

        try {
          // Try to parse as JSON for complex values
          const parsedValue = JSON.parse(value);

          // Check if it's a filter key (exists in stableDefaultFilters)
          if (cleanKey in stableDefaultFilters) {
            filters[cleanKey] = parsedValue;
          }
          // Check if it's a pagination key (exists in stableDefaultPagination)
          else if (cleanKey in stableDefaultPagination) {
            pagination[cleanKey] = parsedValue;
          }
        } catch {
          // Fallback to string value, but coerce pagination numbers
          if (cleanKey in stableDefaultFilters) {
            filters[cleanKey] = value;
          } else if (cleanKey in stableDefaultPagination) {
            // Type coerce pagination values based on default type
            const defaultValue = (stableDefaultPagination as any)[cleanKey];
            if (typeof defaultValue === 'number') {
              const numValue = parseInt(value, 10);
              pagination[cleanKey] = isNaN(numValue) ? defaultValue : numValue;
            } else {
              pagination[cleanKey] = value;
            }
          }
        }
      }

      return { filters, pagination };
    } catch (error) {
      return { filters: {}, pagination: {} };
    }
  }, [enabled, namespace, stableDefaultFilters, stableDefaultPagination]);

  // Helper to get current path from hash
  const getCurrentPath = useCallback(() => {
    if (typeof window === "undefined") return "/";

    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return "/";

    // Extract path part: "/path?param1=x&..." -> "/path"
    const [path] = hash.split("?");
    return path || "/";
  }, []);

  // Initialize state - read from hash ONLY on initial mount
  const [filters, setFiltersState] = useState<TFilters>(() => {
    if (!enabled || typeof window === "undefined") {
      currentFilters.current = stableDefaultFilters;
      return stableDefaultFilters;
    }

    const { filters: hashFilters } = parseHashParams();
    const initialFilters = { ...stableDefaultFilters, ...hashFilters };
    currentFilters.current = initialFilters;
    return initialFilters;
  });

  const [pagination, setPaginationState] = useState<TPagination>(() => {
    if (!enabled || typeof window === "undefined") {
      currentPagination.current = stableDefaultPagination;
      return stableDefaultPagination;
    }

    const { pagination: hashPagination } = parseHashParams();
    const initialPagination = { ...stableDefaultPagination, ...hashPagination };
    currentPagination.current = initialPagination;
    return initialPagination;
  });

  // Helper to update hash params (write-only, preserves path and merges params)
  const updateHashParams = useCallback(
    (newFilters: TFilters, newPagination: TPagination) => {
      if (!enabled || typeof window === "undefined") return;

      try {
        const currentPath = getCurrentPath();
        const params = new URLSearchParams();

        // Preserve existing params that aren't our filters or pagination
        const hash = window.location.hash.slice(1);
        if (hash) {
          const [, queryString] = hash.split("?");
          if (queryString) {
            const existingParams = new URLSearchParams(queryString);
            for (const [key, value] of existingParams.entries()) {
              // Remove namespace prefix if present for comparison
              const cleanKey =
                namespace && key.startsWith(`${namespace}_`)
                  ? key.replace(`${namespace}_`, "")
                  : key;

              // Keep param if it's not one of our filter/pagination keys
              if (
                !(cleanKey in stableDefaultFilters) &&
                !(cleanKey in stableDefaultPagination)
              ) {
                // But skip if it has a different namespace
                if (
                  namespace &&
                  key.includes("_") &&
                  !key.startsWith(`${namespace}_`)
                ) {
                  params.set(key, value);
                } else if (!namespace && !key.includes("_")) {
                  params.set(key, value);
                }
              }
            }
          }
        }

        // NOTE: We don't preserve old filter/pagination params - they get completely 
        // replaced by the current state. This ensures removed filters (like selecting "All") 
        // actually disappear from the URL.

        // Add all filter params - just serialize current state, no clever logic
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            const paramValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            const namespacedKey = namespace ? `${namespace}_${key}` : key;
            params.set(namespacedKey, paramValue);
          }
        });

        // Add all pagination params - just serialize current state  
        Object.entries(newPagination).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            const paramValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            const namespacedKey = namespace ? `${namespace}_${key}` : key;
            params.set(namespacedKey, paramValue);
          }
        });

        const queryString = params.toString();
        const newHash = queryString
          ? `${currentPath}?${queryString}`
          : currentPath;
        const currentFullHash = window.location.hash.slice(1);

        // Only update if hash actually changed
        if (newHash !== currentFullHash) {
          // Use replaceState to avoid adding to browser history for every filter change
          const newUrl = `${window.location.pathname}${window.location.search}#${newHash}`;
          window.history.replaceState(null, "", newUrl);
        }
      } catch (error) {}
    },
    [
      enabled,
      namespace,
    ],
  );

  // Debounced hash update
  const debouncedUpdateHash = useCallback(
    (newFilters: TFilters, newPagination: TPagination) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        updateHashParams(newFilters, newPagination);
      }, 100);
    },
    [updateHashParams],
  );

  // Filter setter
  const setFilters = useCallback(
    (updates: Partial<TFilters> | ((prev: TFilters) => TFilters)) => {
      setFiltersState((prev) => {
        const newFilters =
          typeof updates === "function"
            ? updates(prev)
            : { ...prev, ...updates };



        // Update ref
        currentFilters.current = newFilters;

        // Update hash params (write-only, never read back)
        if (!isInitialMount.current) {
          debouncedUpdateHash(newFilters, currentPagination.current);
        }

        return newFilters;
      });
    },
    [debouncedUpdateHash],
  );

  // Pagination setter
  const setPagination = useCallback(
    (updates: Partial<TPagination> | ((prev: TPagination) => TPagination)) => {
      setPaginationState((prev) => {
        const newPagination =
          typeof updates === "function"
            ? updates(prev)
            : { ...prev, ...updates };

        // Update ref
        currentPagination.current = newPagination;

        // Update hash params (write-only, never read back)
        if (!isInitialMount.current) {
          debouncedUpdateHash(currentFilters.current, newPagination);
        }

        return newPagination;
      });
    },
    [debouncedUpdateHash],
  );

  // Mark initial mount as complete after first render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Don't update hash during initial mount - this causes unnecessary re-renders
      // The hash should only be updated when state changes from user interaction
    }
  }, []);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    filters,
    setFilters,
    pagination,
    setPagination,
  };
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

interface UseLocalStoragePersistenceProps {
  selectedRoles: string[];
  persistRoles: boolean;
  localStorageKey: string;
}

export function useLocalStoragePersistence({
  selectedRoles,
  persistRoles,
  localStorageKey,
}: UseLocalStoragePersistenceProps) {
  // Save selected roles to localStorage whenever they change
  useEffect(() => {
    if (!persistRoles) return;

    try {
      localStorage.setItem(localStorageKey, JSON.stringify(selectedRoles));
    } catch (error) {}
  }, [selectedRoles, persistRoles, localStorageKey]);
}
