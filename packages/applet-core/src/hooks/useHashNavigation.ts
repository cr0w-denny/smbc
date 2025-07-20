import { useState, useCallback, useEffect, useRef } from "react";

interface HashState {
  path: string;
  params: Record<string, any>;
}

interface UseHashOptions {
  namespace?: string;
  defaultParams?: Record<string, any>;
  mountPath?: string;
}

/**
 * Unified hash management hook
 * 
 * Handles both navigation (#/path) and state (?param=value) in one place
 * Format: #/path?param1=value1&param2=value2
 */
export function useHashNavigation(options: UseHashOptions = {}) {
  const { namespace, defaultParams = {}, mountPath } = options;
  const isInitialMount = useRef(true);

  // Parse current hash into path and params
  const parseHash = useCallback((): HashState => {
    const hash = window.location.hash.slice(1) || "/";
    const [path, queryString] = hash.split("?");
    
    const params: Record<string, any> = { ...defaultParams };
    
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
        // For navigation-only mode: include all params (defaultParams is empty)
        if (Object.keys(defaultParams).length > 0 && !(cleanKey in defaultParams)) continue;
        
        // Parse value
        try {
          params[cleanKey] = JSON.parse(value);
        } catch {
          // Fallback for non-JSON values
          const defaultValue = defaultParams[cleanKey];
          if (typeof defaultValue === 'number') {
            const numValue = parseInt(value, 10);
            params[cleanKey] = isNaN(numValue) ? defaultValue : numValue;
          } else if (typeof defaultValue === 'boolean') {
            params[cleanKey] = value === 'true';
          } else {
            params[cleanKey] = value;
          }
        }
      }
    }
    
    return { path: path || "/", params };
  }, [namespace, defaultParams]);

  // Initialize state
  const [hashState, setHashState] = useState<HashState>(parseHash);

  // Update hash in URL
  const updateHash = useCallback((newState: HashState, isNavigation: boolean = false) => {
    const params = new URLSearchParams();
    
    // Only preserve non-namespace params if we're NOT navigating
    if (!isNavigation) {
      const currentHash = window.location.hash.slice(1);
      if (currentHash) {
        const [, currentQuery] = currentHash.split("?");
        if (currentQuery) {
          const existingParams = new URLSearchParams(currentQuery);
          for (const [key, value] of existingParams.entries()) {
            const cleanKey = namespace && key.startsWith(`${namespace}_`)
              ? key.replace(`${namespace}_`, "")
              : key;
            
            // Keep if not our param
            if (!(cleanKey in defaultParams)) {
              if (!namespace || !key.includes("_") || !key.startsWith(`${namespace}_`)) {
                params.set(key, value);
              }
            }
          }
        }
      }
    }
    
    // Add our params (only non-default values)
    Object.entries(newState.params).forEach(([key, value]) => {
      const defaultValue = defaultParams[key];
      if (JSON.stringify(value) !== JSON.stringify(defaultValue) && value !== undefined) {
        const paramKey = namespace ? `${namespace}_${key}` : key;
        const paramValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        params.set(paramKey, paramValue);
      }
    });
    
    // Build new hash
    const queryString = params.toString();
    const newHash = queryString ? `${newState.path}?${queryString}` : newState.path;
    
    if (newHash !== window.location.hash.slice(1)) {
      if (isNavigation) {
        // Use location.hash for navigation to trigger hashchange event
        window.location.hash = newHash;
      } else {
        // Use replaceState for param updates to avoid history pollution
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${newHash}`);
      }
    }
  }, [namespace, defaultParams]);

  // Navigation function
  const navigate = useCallback((path: string) => {
    setHashState(() => {
      // Reset params to defaults when navigating
      const newState = { path, params: defaultParams };
      if (!isInitialMount.current) {
        // Use setTimeout to avoid updating during render
        setTimeout(() => updateHash(newState, true), 0);
      }
      return newState;
    });
  }, [updateHash, defaultParams]);

  // Params update function  
  const setParams = useCallback((updates: Partial<Record<string, any>> | ((prev: Record<string, any>) => Record<string, any>)) => {
    setHashState(prev => {
      const newParams = typeof updates === "function" ? updates(prev.params) : { ...prev.params, ...updates };
      const newState = { ...prev, params: newParams };
      
      if (!isInitialMount.current) {
        // Use setTimeout to avoid updating during render
        setTimeout(() => updateHash(newState), 0);
      }
      
      return newState;
    });
  }, [updateHash]);

  // Combined update
  const setHash = useCallback((path: string, params: Record<string, any>) => {
    const newState = { path, params };
    setHashState(newState);
    if (!isInitialMount.current) {
      updateHash(newState, true); // setHash is typically used for navigation
    }
  }, [updateHash]);

  // Listen for external hash changes (back/forward, direct navigation)
  useEffect(() => {
    const handleHashChange = () => {
      if (!isInitialMount.current) {
        setHashState(parseHash());
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [parseHash]);

  // Mark initial mount complete
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Handle scoped navigation for mountPath
  const currentPath = mountPath && hashState.path.startsWith(mountPath)
    ? hashState.path.slice(mountPath.length) || "/"
    : hashState.path;

  const scopedNavigate = useCallback((relativePath: string) => {
    if (mountPath) {
      const fullPath = relativePath === "/" ? mountPath : `${mountPath}${relativePath}`;
      navigate(fullPath);
    } else {
      navigate(relativePath);
    }
  }, [mountPath, navigate]);

  return {
    // Current state
    path: currentPath,
    params: hashState.params,
    
    // Navigation
    navigate: scopedNavigate,
    
    // State management
    setParams,
    
    // Combined update
    setHash,
  };
}