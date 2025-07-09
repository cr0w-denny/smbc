import { useState, useCallback, useEffect } from "react";

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