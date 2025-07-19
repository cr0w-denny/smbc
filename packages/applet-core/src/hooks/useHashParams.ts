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
export function useHashParams<TState extends Record<string, any>>(
  defaultState: TState,
  options: {
    enabled?: boolean;
    namespace?: string;
  } = {},
): {
  state: TState;
  setState: (
    updates: Partial<TState> | ((prev: TState) => TState),
  ) => void;
  syncHash: () => void;
} {
  const { enabled = true, namespace } = options;
  
  // Memoize default values to prevent unnecessary re-renders
  const stableDefaultState = React.useMemo(() => defaultState, [JSON.stringify(defaultState)]);
  
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  
  // Track current state with refs to avoid unnecessary re-renders
  const currentState = useRef<TState>(defaultState);
  
  

  // Helper to parse current hash params
  const parseHashParams = useCallback(() => {
    if (!enabled || typeof window === "undefined")
      return {};

    try {
      const hash = window.location.hash.slice(1); // Remove #
      if (!hash) return {};

      // Split path and query params: "/path?param1=x&..." -> ["/path", "param1=x&..."]
      const [, queryString] = hash.split("?");
      if (!queryString) return {};

      const params = new URLSearchParams(queryString);
      const parsedState: Record<string, any> = {};

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

        // Only process keys that exist in our default state
        if (!(cleanKey in stableDefaultState)) {
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
          parsedState[cleanKey] = parsedValue;
        } catch {
          // Fallback: try to coerce based on default type
          const defaultValue = stableDefaultState[cleanKey];
          if (typeof defaultValue === 'number') {
            const numValue = parseInt(value, 10);
            parsedState[cleanKey] = isNaN(numValue) ? defaultValue : numValue;
          } else if (typeof defaultValue === 'boolean') {
            parsedState[cleanKey] = value === 'true';
          } else {
            parsedState[cleanKey] = processedValue;
          }
        }
      }

      return parsedState;
    } catch (error) {
      return {};
    }
  }, [enabled, namespace, stableDefaultState]);

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
  const [state, setStateInternal] = useState<TState>(() => {
    if (!enabled || typeof window === "undefined") {
      currentState.current = stableDefaultState;
      return stableDefaultState;
    }

    const hashState = parseHashParams();
    const initialState = { ...stableDefaultState, ...hashState };
    currentState.current = initialState;
    return initialState;
  });

  // Helper to update hash params (write-only, preserves path and merges params)
  const updateHashParams = useCallback(
    (newState: TState) => {
      if (!enabled || typeof window === "undefined") return;

      try {
        const currentPath = getCurrentPath();
        const params = new URLSearchParams();

        // Preserve existing params that aren't our state keys
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

              // Keep param if it's not one of our state keys
              if (!(cleanKey in stableDefaultState)) {
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

        // NOTE: We don't preserve old state params - they get completely 
        // replaced by the current state. This ensures removed values actually disappear from the URL.

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

        // Add state params - only include non-default values
        Object.entries(newState).forEach(([key, value]) => {
          const defaultValue = stableDefaultState[key];
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
    [enabled, namespace, stableDefaultState],
  );

  // Debounced hash update
  const debouncedUpdateHash = useCallback(
    (newState: TState) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        updateHashParams(newState);
      }, 100);
    },
    [updateHashParams],
  );

  // State setter
  const setState = useCallback(
    (updates: Partial<TState> | ((prev: TState) => TState)) => {
      setStateInternal((prev) => {
        const newState =
          typeof updates === "function"
            ? updates(prev)
            : { ...prev, ...updates };

        // Update ref
        currentState.current = newState;

        // Update hash params (write-only, never read back)
        if (!isInitialMount.current) {
          debouncedUpdateHash(newState);
        }

        return newState;
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
    updateHashParams(state);
  }, [enabled, state, updateHashParams]);


  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    state,
    setState,
    syncHash,
  };
}