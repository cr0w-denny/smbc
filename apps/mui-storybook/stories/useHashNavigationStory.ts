import { useState, useCallback, useMemo } from "react";
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
  defaults: Record<string, any> = {},
): { path: string; params: Record<string, any> } {
  const hash = hashUrl.slice(1) || "/";
  const [path, queryString] = hash.split("?");

  const params: Record<string, any> = { ...defaults };

  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams.entries()) {
      // Handle namespace
      const cleanKey =
        namespace && key.startsWith(`${namespace}_`)
          ? key.replace(`${namespace}_`, "")
          : key;

      // Skip if not our namespace
      if (namespace && key.includes("_") && !key.startsWith(`${namespace}_`))
        continue;

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
  onUrlChange?: (url: string) => void,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== false
    ) {
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

export function useHashNavigationStory<
  TAutoParams extends Record<string, any> = {},
  TDraftParams extends Record<string, any> = {},
>(
  autoDefaults: Record<string, any> = {},
  draftDefaults: Record<string, any> = {},
  options: UseHashNavigationStoryOptions = {},
) {
  const { namespace, mountPath, initialUrl = "#/", onUrlChange } = options;

  // Create stable transformer
  const transformer = useMemo(() => {
    const allDefaults = { ...autoDefaults, ...draftDefaults };
    const config = inferTransformConfig(allDefaults);
    return createFieldTransformer(config);
  }, []);

  // Parse initial URL once
  const initialState = useMemo(() => {
    const allDefaults = { ...autoDefaults, ...draftDefaults };
    const { path, params: rawParams } = parseHash(
      initialUrl,
      namespace,
      allDefaults,
    );
    const transformedParams = transformer.ui(rawParams);

    const scopedPath =
      mountPath && path.startsWith(mountPath)
        ? path.slice(mountPath.length) || "/"
        : path;

    const autoParams: Record<string, any> = {};
    const draftParams: Record<string, any> = {};

    Object.keys(autoDefaults).forEach((key) => {
      autoParams[key] = transformedParams[key] ?? autoDefaults[key];
    });

    Object.keys(draftDefaults).forEach((key) => {
      draftParams[key] = transformedParams[key] ?? draftDefaults[key];
    });

    return { path: scopedPath, autoParams, draftParams };
  }, []);

  // State
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [currentPath, setCurrentPath] = useState(initialState.path);
  const [autoParams, setAutoParams] = useState(initialState.autoParams);
  const [draftParams, setDraftParams] = useState(initialState.draftParams);
  const [appliedDraftParams, setAppliedDraftParams] = useState(
    initialState.draftParams,
  );

  // URL update helper
  const updateUrl = useCallback(
    (newUrl: string) => {
      setCurrentUrl(newUrl);
      if (onUrlChange) {
        onUrlChange(newUrl);
      }
    },
    [onUrlChange],
  );

  // Navigation function
  const navigate = useCallback(
    (relativePath: string) => {
      setCurrentPath(relativePath);
      const fullPath = mountPath
        ? relativePath === "/"
          ? mountPath
          : `${mountPath}${relativePath}`
        : relativePath;
      const combinedParams = { ...autoParams, ...appliedDraftParams };
      updateHash(
        fullPath,
        transformer.url(combinedParams),
        namespace,
        updateUrl,
      );
    },
    [
      autoParams,
      appliedDraftParams,
      transformer,
      namespace,
      mountPath,
      updateUrl,
    ],
  );

  // Set auto params function (immediate URL sync)
  const updateAutoParams = useCallback(
    (newParams: TAutoParams | ((prev: TAutoParams) => TAutoParams)) => {
      const resolvedParams =
        typeof newParams === "function"
          ? newParams(autoParams as TAutoParams)
          : newParams;

      setAutoParams(resolvedParams);

      const combinedParams = { ...resolvedParams, ...appliedDraftParams };
      const fullPath = mountPath
        ? currentPath === "/"
          ? mountPath
          : `${mountPath}${currentPath}`
        : currentPath;
      updateHash(
        fullPath,
        transformer.url(combinedParams),
        namespace,
        updateUrl,
      );
    },
    [
      autoParams,
      appliedDraftParams,
      currentPath,
      mountPath,
      transformer,
      namespace,
      updateUrl,
    ],
  );

  // Set draft params function (no immediate URL sync)
  const updateDraftParams = useCallback(
    (newParams: TDraftParams | ((prev: TDraftParams) => TDraftParams)) => {
      const resolvedParams =
        typeof newParams === "function"
          ? newParams(draftParams as TDraftParams)
          : newParams;

      setDraftParams(resolvedParams);
    },
    [draftParams],
  );

  // Apply draft params to URL
  const applyDraftParams = useCallback(
    (overrideParams?: TDraftParams) => {
      const paramsToApply = overrideParams || draftParams;

      // Simple filtering - only remove empty/false/null values
      const filteredParams = { ...paramsToApply };
      Object.keys(filteredParams).forEach((key) => {
        const val = filteredParams[key];
        if (val === "" || val === false || val === null || val === undefined) {
          delete filteredParams[key];
        }
      });

      setAppliedDraftParams(filteredParams);
      setDraftParams(filteredParams);
      const combinedParams = { ...autoParams, ...filteredParams };
      const fullPath = mountPath
        ? currentPath === "/"
          ? mountPath
          : `${mountPath}${currentPath}`
        : currentPath;
      updateHash(
        fullPath,
        transformer.url(combinedParams),
        namespace,
        updateUrl,
      );
    },
    [
      draftParams,
      currentPath,
      transformer,
      namespace,
      mountPath,
      autoParams,
      updateUrl,
    ],
  );

  // Check for changes in draft params (simplified)
  const hasChanges = useMemo(() => {
    const draftKeys = Object.keys(draftParams);
    const appliedKeys = Object.keys(appliedDraftParams);

    if (draftKeys.length !== appliedKeys.length) return true;

    return draftKeys.some((key) => {
      const draftVal = draftParams[key];
      const appliedVal = appliedDraftParams[key];

      if (draftVal instanceof Date && appliedVal instanceof Date) {
        return draftVal.getTime() !== appliedVal.getTime();
      }

      if (Array.isArray(draftVal) && Array.isArray(appliedVal)) {
        return (
          JSON.stringify(draftVal.sort()) !== JSON.stringify(appliedVal.sort())
        );
      }

      return draftVal !== appliedVal;
    });
  }, [draftParams, appliedDraftParams]);

  // Return unified interface
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
