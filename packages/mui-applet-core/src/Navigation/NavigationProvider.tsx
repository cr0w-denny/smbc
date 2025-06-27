/**
 * NavigationProvider - manages navigation state and business logic
 */

import React, { createContext, useContext, useState, useMemo } from "react";
import { useNavigation, useRoleManagement } from "@smbc/applet-core";
import type { NavigationProviderProps, NavigationContextValue } from "./types";

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const { navigation } = useNavigation();
  const { hasPermission } = useRoleManagement();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get current path from URL hash
  const activeItemPath = useMemo(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return "/";
    const hashContent = hash.slice(1);
    const queryIndex = hashContent.indexOf("?");
    return queryIndex >= 0 ? hashContent.slice(0, queryIndex) : hashContent;
  }, []);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const navigate = (path: string) => {
    // Update URL hash
    window.location.hash = path;
    console.log("Navigate to:", path);
  };

  const checkPermission = (appletId: string, permission: string): boolean => {
    return hasPermission(appletId, permission);
  };

  const contextValue: NavigationContextValue = {
    navigation,
    activeItemPath,
    expandedItems,
    toggleExpand,
    navigate,
    hasPermission: checkPermission,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider",
    );
  }
  return context;
};
