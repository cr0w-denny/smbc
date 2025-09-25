import { useState, useCallback, useMemo, useEffect } from 'react';
import { useHashNavigation } from './useHashNavigation';

/**
 * Wraps useHashNavigation to add apply-only filter behavior
 * Filters are only synced to URL when explicitly applied
 */
export function useHashNavigationWithApply<T extends Record<string, any>>(config?: {
  defaultParams?: T;
  namespace?: string;
}) {
  const { params: urlParams, setParams: setUrlParams, ...rest } = useHashNavigation(config);

  // Local state for UI filters (not in URL until applied)
  const [localParams, setLocalParams] = useState(urlParams);

  // Sync local state when URL changes (after apply/reset)
  useEffect(() => {
    setLocalParams(urlParams);
  }, [urlParams]);

  // Check if local params differ from URL params
  const hasChanges = useMemo(() => {
    // Compare each key-value pair individually
    const keys = new Set([...Object.keys(localParams), ...Object.keys(urlParams)]);
    for (const key of keys) {
      const localVal = localParams[key];
      const urlVal = urlParams[key];

      // Handle arrays
      if (Array.isArray(localVal) || Array.isArray(urlVal)) {
        const localStr = Array.isArray(localVal) ? localVal.sort().join(',') : localVal;
        const urlStr = Array.isArray(urlVal) ? urlVal.sort().join(',') : urlVal;
        if (localStr !== urlStr) return true;
        continue;
      }

      // Handle other values
      if (localVal !== urlVal) return true;
    }
    return false;
  }, [localParams, urlParams]);

  // Apply local changes to URL
  const applyParams = useCallback((overrideParams?: T) => {
    setUrlParams(overrideParams || localParams);
  }, [localParams, setUrlParams]);

  return {
    // UI state
    params: localParams,
    setParams: setLocalParams,

    // Applied state (in URL)
    appliedParams: urlParams,

    // Apply function and change detection
    applyParams,
    hasChanges,

    // Pass through other props
    ...rest,
  };
}