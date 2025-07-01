/**
 * Pure NavigationList component - renders a list of navigation items
 */

import React from "react";
import { List } from "@mui/material";
import { NavigationItem } from "./NavigationItem";
import type { NavigationListProps } from "./types";

export const NavigationList: React.FC<NavigationListProps> = ({
  items,
  activeItemPath,
  expandedItems = new Set(),
  onToggleExpand,
  onNavigate,
  shouldShowItem = () => true,
}) => {
  const isItemActive = (itemPath?: string): boolean => {
    return !!itemPath && itemPath === activeItemPath;
  };

  const isParentOfActiveItem = (item: any): boolean => {
    if (!item.children) return false;

    return item.children.some(
      (child: any) => isItemActive(child.path) || isParentOfActiveItem(child),
    );
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const isActive = isItemActive(item.path);
    const isExpanded = expandedItems.has(item.id);
    const isParentOfActive = isParentOfActiveItem(item);
    const showItem = shouldShowItem(item);

    return (
      <React.Fragment key={item.id}>
        <NavigationItem
          item={item}
          level={level}
          isActive={isActive}
          isExpanded={isExpanded}
          isParentOfActive={isParentOfActive}
          onToggleExpand={() => onToggleExpand?.(item.id)}
          onNavigate={onNavigate}
          showItem={showItem}
        />

        {/* Render children recursively */}
        {showItem && item.children && isExpanded && (
          <>
            {item.children.map((child: any) =>
              renderNavigationItem(child, level + 1),
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  return <List>{items.map((item) => renderNavigationItem(item))}</List>;
};
