import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Internal hook for URL hash synchronization (client-side routing format: #/path?param1=x&...)
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

        // Add filter params
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            const paramValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            params.set(addNamespace(key), paramValue);
          }
        });

        // Add pagination params
        Object.entries(newPagination).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
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
          debouncedUpdateHash(newFilters, pagination);
        }

        return newFilters;
      });
    },
    [debouncedUpdateHash, pagination],
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
          debouncedUpdateHash(filters, newPagination);
        }

        return newPagination;
      });
    },
    [debouncedUpdateHash, filters],
  );

  // Mark initial mount as complete after first render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Update hash with initial state if it differs from what was parsed
      debouncedUpdateHash(filters, pagination);
    }
  }, [filters, pagination, debouncedUpdateHash]);

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
