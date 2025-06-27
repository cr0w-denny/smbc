/**
 * Stateful Navigation types - extends pure UI types with business logic
 */

import type { NavigationItem } from "@smbc/applet-core";

// Use the NavigationItem from mui-applet-core directly
export type NavigationItemData = NavigationItem;

export interface NavigationProviderProps {
  children: React.ReactNode;
}

export interface NavigationContextValue {
  navigation: NavigationItemData[];
  activeItemPath: string;
  expandedItems: Set<string>;
  toggleExpand: (itemId: string) => void;
  navigate: (path: string) => void;
  hasPermission: (appletId: string, permission: string) => boolean;
}
