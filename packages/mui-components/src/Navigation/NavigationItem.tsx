/**
 * Pure NavigationItem component - no business logic, just UI
 */

import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  useTheme,
} from "@mui/material";
import { ExpandLess, ExpandMore, ChevronRight } from "@mui/icons-material";
import type { NavigationItemProps } from "./types";

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  level = 0,
  isActive = false,
  isExpanded = false,
  isParentOfActive = false,
  onToggleExpand,
  onNavigate,
  showItem = true,
}) => {
  const theme = useTheme();

  if (!showItem) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand?.();
    } else if (item.path) {
      onNavigate?.(item.path);
    }
  };

  const itemButton = (
    <ListItemButton
      onClick={handleClick}
      disabled={item.disabled}
      selected={isActive}
      sx={{
        pl: 2 + level * 2,
        backgroundColor: isActive
          ? theme.palette.action.selected
          : isParentOfActive
            ? theme.palette.action.hover
            : "transparent",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&.Mui-selected": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.contrastText,
          },
        },
      }}
    >
      {/* Icon */}
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: isActive ? "inherit" : theme.palette.action.active,
        }}
      >
        {item.icon ? <item.icon /> : hasChildren ? <ChevronRight /> : null}
      </ListItemIcon>

      {/* Text with badge */}
      <ListItemText
        primary={
          item.badge ? (
            <Badge
              badgeContent={item.badge.count}
              color={item.badge.color || "primary"}
              variant={item.badge.variant || "standard"}
            >
              {item.label}
            </Badge>
          ) : (
            item.label
          )
        }
        sx={{
          "& .MuiListItemText-primary": {
            fontSize: level > 0 ? "0.875rem" : "1rem",
            fontWeight: isActive ? 600 : 400,
          },
        }}
      />

      {/* Expand/collapse icon for items with children */}
      {hasChildren && (
        <ListItemIcon sx={{ minWidth: 24 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemIcon>
      )}
    </ListItemButton>
  );

  return (
    <>
      <ListItem disablePadding>{itemButton}</ListItem>

      {/* Render children with collapse animation */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout={200}>
          {item.children?.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={false} // Will be determined by parent logic
              isExpanded={false} // Will be determined by parent logic
              onToggleExpand={() => {}} // Will be handled by parent
              onNavigate={onNavigate}
              showItem={true} // Will be determined by parent
            />
          ))}
        </Collapse>
      )}
    </>
  );
};
