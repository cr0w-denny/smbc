/**
 * ConnectedNavigationDrawer - connects pure UI components with business logic
 */

import React from "react";
import {
  NavigationDrawer,
  NavigationList,
  type NavigationDrawerProps as BaseNavigationDrawerProps,
} from "@smbc/mui-components";
import { useNavigationContext } from "./NavigationProvider";
import type { NavigationItemData } from "./types";

interface ConnectedNavigationDrawerProps
  extends Omit<BaseNavigationDrawerProps, "children"> {
  title?: string;
}

export const ConnectedNavigationDrawer: React.FC<
  ConnectedNavigationDrawerProps
> = ({ open, onClose, width, variant = "temporary", title = "Navigation" }) => {
  const {
    navigation,
    activeItemPath,
    expandedItems,
    toggleExpand,
    navigate,
    hasPermission,
  } = useNavigationContext();

  // Convert navigation items to pure UI format and handle permissions
  const convertToUIFormat = (items: NavigationItemData[]): any[] => {
    return items.map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      icon: item.icon as any, // Type conversion for icon component
      badge: item.badge
        ? {
            count: typeof item.badge === "number" ? item.badge : undefined,
            color: "primary" as const,
          }
        : undefined,
      disabled: false,
      children: item.children ? convertToUIFormat(item.children) : undefined,
    }));
  };

  // Check if user should see this navigation item based on permissions
  const shouldShowItem = (item: any): boolean => {
    // Find the original item with permission data
    const findOriginalItem = (
      items: NavigationItemData[],
      id: string,
    ): NavigationItemData | null => {
      for (const navItem of items) {
        if (navItem.id === id) return navItem;
        if (navItem.children) {
          const found = findOriginalItem(navItem.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const originalItem = findOriginalItem(navigation, item.id);
    if (!originalItem) return true;

    // Check permissions if required
    if (originalItem.requiredPermissions && originalItem.appletId) {
      return originalItem.requiredPermissions.some((permission) =>
        hasPermission(originalItem.appletId!, permission),
      );
    }

    return true;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === "temporary") {
      onClose();
    }
  };

  const uiNavigationItems = convertToUIFormat(navigation);

  return (
    <NavigationDrawer
      open={open}
      onClose={onClose}
      width={width}
      variant={variant}
      title={title}
    >
      <NavigationList
        items={uiNavigationItems}
        activeItemPath={activeItemPath}
        expandedItems={expandedItems}
        onToggleExpand={toggleExpand}
        onNavigate={handleNavigate}
        shouldShowItem={shouldShowItem}
      />
    </NavigationDrawer>
  );
};
