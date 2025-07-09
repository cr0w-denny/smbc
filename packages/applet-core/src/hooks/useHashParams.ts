import React, { useState, useCallback, useEffect, useRef } from "react";

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
  TPagination extends Record<string, any> = {},
>(
  defaultFilters: TFilters,
  defaultPagination?: TPagination,
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
  syncHash: () => void;
} {
  // Memoize default values to prevent unnecessary re-renders
  const stableDefaultFilters = React.useMemo(() => defaultFilters, [JSON.stringify(defaultFilters)]);
  const stableDefaultPagination = React.useMemo(() => defaultPagination || ({} as TPagination), [JSON.stringify(defaultPagination)]);
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  
  // Track current state with refs to avoid unnecessary re-renders
  const currentFilters = useRef<TFilters>(defaultFilters);
  const currentPagination = useRef<TPagination>(stableDefaultPagination);
  
  

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

        // Handle special string values that should be converted
        let processedValue: any = value;
        if (value === "undefined") {
          processedValue = undefined;
        } else if (value === "null") {
          processedValue = null;
        }

        try {
          // Try to parse as JSON for complex values (but not for the special string "undefined")
          const parsedValue = value === "undefined" ? undefined : JSON.parse(value);

          // Check if it's a filter key (exists in stableDefaultFilters)
          if (cleanKey in stableDefaultFilters) {
            filters[cleanKey] = parsedValue;
          }
          // Check if it's a pagination key (exists in stableDefaultPagination)
          else if (cleanKey in stableDefaultPagination) {
            pagination[cleanKey] = parsedValue;
          }
        } catch {
          // Fallback to processed value, but coerce pagination numbers
          if (cleanKey in stableDefaultFilters) {
            filters[cleanKey] = processedValue;
          } else if (cleanKey in stableDefaultPagination) {
            // Type coerce pagination values based on default type
            const defaultValue = (stableDefaultPagination as any)[cleanKey];
            if (typeof defaultValue === 'number') {
              const numValue = parseInt(value, 10);
              pagination[cleanKey] = isNaN(numValue) ? defaultValue : numValue;
            } else {
              pagination[cleanKey] = processedValue;
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

        // Canonical function to check if a value matches its default
        const isDefault = (value: any, defaultValue: any): boolean => {
          // Handle undefined/null cases - if value is undefined and default is empty string (or vice versa), consider it default
          if (value === undefined || value === null) {
            return defaultValue === undefined || defaultValue === null || defaultValue === "";
          }
          
          // Handle empty strings (common for text filters and "All" selections)
          if (value === "") {
            return defaultValue === "" || defaultValue === undefined || defaultValue === null;
          }
          
          // Deep equality for objects/arrays
          if (typeof value === "object" && typeof defaultValue === "object") {
            return JSON.stringify(value) === JSON.stringify(defaultValue);
          }
          
          // Simple equality for primitives
          return value === defaultValue;
        };

        // Add filter params - only include non-default values
        Object.entries(newFilters).forEach(([key, value]) => {
          const defaultValue = stableDefaultFilters[key];
          if (!isDefault(value, defaultValue)) {
            // Skip undefined values to prevent "undefined" strings in URL
            if (value !== undefined) {
              const paramValue =
                typeof value === "object" ? JSON.stringify(value) : String(value);
              const namespacedKey = namespace ? `${namespace}_${key}` : key;
              params.set(namespacedKey, paramValue);
            }
          }
        });

        // Add pagination params - only include non-default values
        Object.entries(newPagination).forEach(([key, value]) => {
          const defaultValue = stableDefaultPagination[key];
          if (!isDefault(value, defaultValue)) {
            // Skip undefined values to prevent "undefined" strings in URL
            if (value !== undefined) {
              const paramValue =
                typeof value === "object" ? JSON.stringify(value) : String(value);
              const namespacedKey = namespace ? `${namespace}_${key}` : key;
              params.set(namespacedKey, paramValue);
            }
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

  // Sync hash function that can be called externally
  const syncHash = useCallback(() => {
    if (!enabled || typeof window === "undefined" || isInitialMount.current) return;
    updateHashParams(filters, pagination);
  }, [enabled, filters, pagination, updateHashParams]);


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
    syncHash,
  };
}