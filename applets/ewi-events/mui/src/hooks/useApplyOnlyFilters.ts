import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for managing filters that only apply when explicitly triggered
 * Handles URL sync and prevents auto-filtering
 */
export function useApplyOnlyFilters<T extends Record<string, any>>(
  urlParams: T,
  setUrlParams: (params: T) => void
) {
  // Local filter state (UI only, not synced to URL)
  const [localFilters, setLocalFilters] = useState<T>(urlParams);

  // Sync local filters with URL when URL changes (after apply/reset)
  useState(() => {
    setLocalFilters(urlParams);
  });

  // Check if filters have changed
  const hasChanges = useMemo(() => {
    // Simple string comparison, avoiding circular refs
    const serialize = (obj: any) => {
      try {
        return JSON.stringify(obj);
      } catch {
        // If circular ref, just compare keys and primitive values
        const keys = Object.keys(obj).sort();
        return keys.map(k => {
          const v = obj[k];
          if (typeof v === 'object' && v !== null) return k;
          return `${k}:${v}`;
        }).join(',');
      }
    };

    return serialize(localFilters) !== serialize(urlParams);
  }, [localFilters, urlParams]);

  // Apply filters - sync to URL
  const applyFilters = useCallback((values?: T) => {
    setUrlParams(values || localFilters);
  }, [localFilters, setUrlParams]);

  // Reset filters
  const resetFilters = useCallback((defaultValues: T) => {
    setLocalFilters(defaultValues);
    setUrlParams(defaultValues);
  }, [setUrlParams]);

  return {
    filters: localFilters,
    setFilters: setLocalFilters,
    appliedFilters: urlParams,
    hasChanges,
    applyFilters,
    resetFilters,
  };
}