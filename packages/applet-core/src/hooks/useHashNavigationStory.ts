import { useState, useCallback, useMemo, useEffect } from "react";
import { createFieldTransformer } from "@smbc/ui-core";

interface UseHashNavigationOptions {
  namespace?: string;
  mountPath?: string;
  autoApply?: boolean; // Legacy - not used in two-stream version
}

interface UseHashNavigationStoryOptions extends UseHashNavigationOptions {
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}

/**
 * Auto-infer transformation config from defaults types
 */
function inferTransformConfig(defaults: Record<string, any>) {
  const config: {
    arrayFields: string[];
    booleanFields: string[];
    dateFields: string[];
    numberFields: string[];
    dateRangeFields: string[];
  } = {
    arrayFields: [],
    booleanFields: [],
    dateFields: [],
    numberFields: [],
    dateRangeFields: [],
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      config.arrayFields.push(key);
    } else if (typeof value === "boolean") {
      config.booleanFields.push(key);
    } else if (value instanceof Date) {
      config.dateFields.push(key);
    } else if (typeof value === "number") {
      config.numberFields.push(key);
    } else if (
      value &&
      typeof value === "object" &&
      ("from" in value || "to" in value)
    ) {
      config.dateRangeFields.push(key);
    }
  });

  return config;
}

/**
 * Parse hash into path and params
 */
function parseHash(
  hashUrl: string,
  namespace?: string,
  defaults: Record<string, any> = {}
): { path: string; params: Record<string, any> } {
  const hash = hashUrl.slice(1) || "/";
  const [path, queryString] = hash.split("?");

  const params: Record<string, any> = { ...defaults };

  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams.entries()) {
      // Handle namespace
      const cleanKey = namespace && key.startsWith(`${namespace}_`)
        ? key.replace(`${namespace}_`, "")
        : key;

      // Skip if not our namespace
      if (namespace && key.includes("_") && !key.startsWith(`${namespace}_`)) continue;

      // For state management mode: only include params we know about
      if (Object.keys(defaults).length > 0 && !(cleanKey in defaults)) continue;

      // Store raw value - transformations happen later
      params[cleanKey] = value;
    }
  }

  return { path, params };
}

/**
 * Update hash with new path and params
 */
function updateHash(
  path: string,
  params: Record<string, any>,
  namespace?: string,
  onUrlChange?: (url: string) => void
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== false) {
      const namespaceKey = namespace ? `${namespace}_${key}` : key;
      searchParams.set(namespaceKey, String(value));
    }
  });

  const queryString = searchParams.toString();
  const newHash = queryString ? `${path}?${queryString}` : path;

  if (onUrlChange) {
    onUrlChange(`#${newHash}`);
  }
}

/**
 * Story version of useHashNavigation that works with mock URLs
 * Identical behavior to the real hook but doesn't touch window.location
 */
export function useHashNavigationStory<
  TAutoParams extends Record<string, any> = {},
  TDraftParams extends Record<string, any> = {}
>(
  autoDefaults: Record<string, any> = {},
  draftDefaults: Record<string, any> = {},
  options: UseHashNavigationStoryOptions = {}
) {
  const { namespace, mountPath, initialUrl = "#/", onUrlChange } = options;

  // Track current URL in state instead of using window.location
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  // Combine defaults for transformations and parsing
  const allDefaults = useMemo(() => ({ ...autoDefaults, ...draftDefaults }), [autoDefaults, draftDefaults]);

  // Auto-infer transformations from combined defaults
  const transformConfig = useMemo(() => inferTransformConfig(allDefaults), [allDefaults]);
  const transformer = useMemo(() => createFieldTransformer(transformConfig), [transformConfig]);

  // Parse initial hash
  const initialState = useMemo(() => {
    const { path, params: rawParams } = parseHash(currentUrl, namespace, allDefaults);
    const transformedParams = transformer.ui(rawParams);

    // Handle scoped navigation for mountPath
    const scopedPath = mountPath && path.startsWith(mountPath)
      ? path.slice(mountPath.length) || "/"
      : path;

    // Separate auto and draft params
    const autoParams: Record<string, any> = {};
    const draftParams: Record<string, any> = {};

    Object.keys(autoDefaults).forEach(key => {
      autoParams[key] = transformedParams[key] ?? autoDefaults[key];
    });

    Object.keys(draftDefaults).forEach(key => {
      draftParams[key] = transformedParams[key] ?? draftDefaults[key];
    });

    return {
      path: scopedPath,
      autoParams,
      draftParams,
      combinedParams: { ...autoParams, ...draftParams }
    };
  }, [currentUrl, namespace, allDefaults, transformer, mountPath, autoDefaults, draftDefaults]);

  const [currentPath, setCurrentPath] = useState(initialState.path);
  const [autoParams, setAutoParams] = useState(initialState.autoParams);
  const [draftParams, setDraftParams] = useState(initialState.draftParams);
  const [appliedDraftParams, setAppliedDraftParams] = useState(initialState.draftParams);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render to prevent draft param resets
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Custom URL update function
  const updateUrl = useCallback((newUrl: string) => {
    setCurrentUrl(newUrl);
    if (onUrlChange) {
      onUrlChange(newUrl);
    }
  }, [onUrlChange]);

  // Navigation function
  const navigate = useCallback((relativePath: string) => {
    setCurrentPath(relativePath);
    // Handle scoped navigation for mountPath
    const fullPath = mountPath
      ? (relativePath === "/" ? mountPath : `${mountPath}${relativePath}`)
      : relativePath;
    const combinedParams = { ...autoParams, ...appliedDraftParams };
    updateHash(fullPath, transformer.url(combinedParams), namespace, updateUrl);
  }, [autoParams, appliedDraftParams, transformer, namespace, mountPath, updateUrl]);

  // Set auto params function (immediate URL sync)
  const updateAutoParams = useCallback((newParams: TAutoParams | ((prev: TAutoParams) => TAutoParams)) => {
    const resolvedParams = typeof newParams === "function"
      ? newParams(autoParams as TAutoParams)
      : newParams;

    setAutoParams(resolvedParams);

    // Immediate sync to URL
    const combinedParams = { ...resolvedParams, ...appliedDraftParams };
    const fullPath = mountPath
      ? (currentPath === "/" ? mountPath : `${mountPath}${currentPath}`)
      : currentPath;
    updateHash(fullPath, transformer.url(combinedParams), namespace, updateUrl);
  }, [autoParams, appliedDraftParams, currentPath, mountPath, transformer, namespace, updateUrl]);

  // Set draft params function (no immediate URL sync)
  const updateDraftParams = useCallback((newParams: TDraftParams | ((prev: TDraftParams) => TDraftParams)) => {
    const resolvedParams = typeof newParams === "function"
      ? newParams(draftParams as TDraftParams)
      : newParams;

    setDraftParams(resolvedParams);
  }, [draftParams]);

  // Apply draft params to URL
  const applyDraftParams = useCallback((overrideParams?: TDraftParams) => {
    const paramsToApply = overrideParams || draftParams;

    // Filter out parameters that match defaults to keep URL clean
    const filteredParams = { ...paramsToApply };
    Object.keys(filteredParams).forEach(key => {
      const currentVal = filteredParams[key];
      const defaultVal = draftDefaults[key];

      // For dates, don't filter them out - always include dates in URLs for context
      // This ensures date ranges are preserved in shareable links
      if ((currentVal instanceof Date || defaultVal instanceof Date) ||
          (typeof currentVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(currentVal)) ||
          (typeof defaultVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(defaultVal))) {
        // Skip filtering for dates - always keep them in URL
      }
      // For other types, use direct comparison
      else if (currentVal === defaultVal ||
               (Array.isArray(currentVal) && Array.isArray(defaultVal) &&
                currentVal.length === defaultVal.length &&
                currentVal.every((v, i) => v === defaultVal[i]))) {
        delete filteredParams[key];
      }
    });

    setAppliedDraftParams(filteredParams);
    // Sync draft params to match applied params after filtering
    setDraftParams(filteredParams);
    const combinedParams = { ...autoParams, ...filteredParams };
    const fullPath = mountPath
      ? (currentPath === "/" ? mountPath : `${mountPath}${currentPath}`)
      : currentPath;
    updateHash(fullPath, transformer.url(combinedParams), namespace, updateUrl);
  }, [draftParams, currentPath, transformer, namespace, mountPath, draftDefaults, autoParams, updateUrl]);

  // Check for changes in draft params
  const hasChanges = useMemo(() => {
    const keys = new Set([...Object.keys(draftParams), ...Object.keys(appliedDraftParams)]);
    for (const key of keys) {
      const draftVal = draftParams[key];
      const appliedVal = appliedDraftParams[key];

      // Handle arrays
      if (Array.isArray(draftVal) || Array.isArray(appliedVal)) {
        const draftArray = Array.isArray(draftVal) ? draftVal : [];
        const appliedArray = Array.isArray(appliedVal) ? appliedVal : [];
        if (draftArray.length !== appliedArray.length) return true;
        if (draftArray.sort().join(',') !== appliedArray.sort().join(',')) return true;
        continue;
      }

      // Handle dates - normalize both sides to date strings for comparison
      if (draftVal instanceof Date || appliedVal instanceof Date ||
          (typeof draftVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(draftVal)) ||
          (typeof appliedVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(appliedVal))) {

        const normalizeDate = (val: any) => {
          if (val instanceof Date) {
            return val.toISOString().split('T')[0];
          }
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
            return val.split('T')[0]; // Handle ISO strings
          }
          return val || '';
        };

        const draftDate = normalizeDate(draftVal);
        const appliedDate = normalizeDate(appliedVal);

        if (draftDate !== appliedDate) return true;
        continue;
      }

      // Handle other values
      if (draftVal !== appliedVal) return true;
    }
    return false;
  }, [draftParams, appliedDraftParams]);

  // Simulate hash changes when currentUrl changes
  useEffect(() => {
    const { path, params: rawParams } = parseHash(currentUrl, namespace, allDefaults);
    const transformedParams = transformer.ui(rawParams);

    // Handle scoped navigation for mountPath
    const scopedPath = mountPath && path.startsWith(mountPath)
      ? path.slice(mountPath.length) || "/"
      : path;

    setCurrentPath(scopedPath);

    // Separate auto and draft params from URL
    const newAutoParams: Record<string, any> = {};
    const newDraftParams: Record<string, any> = {};

    Object.keys(autoDefaults).forEach(key => {
      newAutoParams[key] = transformedParams[key] ?? autoDefaults[key];
    });

    Object.keys(draftDefaults).forEach(key => {
      newDraftParams[key] = transformedParams[key] ?? draftDefaults[key];
    });

    setAutoParams(newAutoParams);

    // Only update draft params from URL if we haven't initialized yet
    // After initialization, draft params should only change via setDraftParams or applyDraftParams
    if (!isInitialized) {
      setDraftParams(newDraftParams);
      setAppliedDraftParams(newDraftParams);
    }
  }, [currentUrl, namespace, allDefaults, transformer, mountPath, autoDefaults, draftDefaults, isInitialized]);

  // Return unified interface with both streams
  return {
    // Auto-applied stream (immediate URL sync)
    autoParams: autoParams as TAutoParams,
    setAutoParams: updateAutoParams,

    // Draft stream (apply pattern)
    params: draftParams as TDraftParams,
    appliedParams: appliedDraftParams as TDraftParams,
    setParams: updateDraftParams,
    applyParams: applyDraftParams,
    hasChanges,

    // Navigation
    navigate,
    path: currentPath,

    // Story-specific additions
    currentUrl,
    setCurrentUrl: updateUrl,
  } as const;
}