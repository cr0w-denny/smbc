import { useState, useCallback, useEffect, useRef } from "react";

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
      setParams((currentParams) => {
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
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Helper to add namespace prefix if provided
  const addNamespace = useCallback(
    (key: string) => {
      return namespace ? `${namespace}_${key}` : key;
    },
    [namespace],
  );

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

          // Check if it's a filter key (exists in defaultFilters)
          if (cleanKey in defaultFilters) {
            filters[cleanKey] = parsedValue;
          }
          // Check if it's a pagination key (exists in defaultPagination)
          else if (cleanKey in defaultPagination) {
            pagination[cleanKey] = parsedValue;
          }
        } catch {
          // Fallback to string value
          if (cleanKey in defaultFilters) {
            filters[cleanKey] = value;
          } else if (cleanKey in defaultPagination) {
            pagination[cleanKey] = value;
          }
        }
      }

      return { filters, pagination };
    } catch (error) {
      return { filters: {}, pagination: {} };
    }
  }, [enabled, namespace, defaultFilters, defaultPagination]);

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
      return defaultFilters;
    }

    const { filters: hashFilters } = parseHashParams();
    return { ...defaultFilters, ...hashFilters };
  });

  const [pagination, setPaginationState] = useState<TPagination>(() => {
    if (!enabled || typeof window === "undefined") {
      return defaultPagination;
    }

    const { pagination: hashPagination } = parseHashParams();
    return { ...defaultPagination, ...hashPagination };
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
                !(cleanKey in defaultFilters) &&
                !(cleanKey in defaultPagination)
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

        // Add filter params (skip default values)
        Object.entries(newFilters).forEach(([key, value]) => {
          const defaultValue = defaultFilters[key];
          if (value !== undefined && value !== null && value !== "" && value !== defaultValue) {
            const paramValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            params.set(addNamespace(key), paramValue);
          }
        });

        // Add pagination params (skip default values)
        Object.entries(newPagination).forEach(([key, value]) => {
          const defaultValue = defaultPagination[key];
          if (value !== undefined && value !== null && value !== "" && value !== defaultValue) {
            const paramValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            params.set(addNamespace(key), paramValue);
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
      getCurrentPath,
      namespace,
      defaultFilters,
      defaultPagination,
      addNamespace,
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

        // Update hash params (write-only, never read back)
        if (!isInitialMount.current) {
          // Use current pagination state at time of update
          setPaginationState((currentPagination) => {
            debouncedUpdateHash(newFilters, currentPagination);
            return currentPagination; // Don't change pagination
          });
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

        // Update hash params (write-only, never read back)
        if (!isInitialMount.current) {
          // Use current filters state at time of update
          setFiltersState((currentFilters) => {
            debouncedUpdateHash(currentFilters, newPagination);
            return currentFilters; // Don't change filters
          });
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
