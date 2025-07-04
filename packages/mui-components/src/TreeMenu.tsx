import React from "react";
import { Box, Chip } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Dashboard as DashboardIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";

/**
 * Navigation route interface
 */
export interface NavigationRoute {
  path: string;
  label: string;
  icon?: React.ComponentType | React.ElementType;
  component?: React.ComponentType;
  requiredPermissions?: string[];
}

/**
 * Hierarchical navigation interfaces
 */
export interface HierarchicalNavigationGroup {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  routes: NavigationRoute[];
}

export interface HierarchicalNavigationSection {
  appletId: string;
  appletLabel: string;
  appletIcon?: React.ComponentType | React.ElementType | string;
  hasInternalNavigation: boolean;
  directRoute?: NavigationRoute;
  homeRoute?: NavigationRoute;
  groups?: HierarchicalNavigationGroup[];
}

/**
 * Props for the TreeMenu component
 */
export interface TreeMenuProps {
  /** Current active path */
  currentPath: string;
  /** Function to handle navigation */
  onNavigate: (path: string) => void;
  /** Root route (usually Dashboard) */
  rootRoute?: NavigationRoute;
  /** Hierarchical applet sections */
  appletSections: HierarchicalNavigationSection[];
  /** Whether to show debug info (applet count chip) */
  showDebugInfo?: boolean;
  /** Number of total applets for debug display */
  totalApplets?: number;
  /** Current search term for auto-expanding matching nodes */
  searchTerm?: string;
}

/**
 * Custom TreeItem with connecting lines and right-side expand/collapse
 */
const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    position: "relative",
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  // Custom expand/collapse button on the right
  "& .custom-expand-button": {
    position: "absolute",
    right: theme.spacing(1),
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.text.primary,
    },
  },
}));

/**
 * Leaf TreeItem (reduced padding)
 */
const LeafTreeItem = styled(TreeItem)(() => ({
  [`& .${treeItemClasses.content}`]: {},
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
}));

/**
 * Child Leaf TreeItem (minimal padding for children of groups with connecting lines)
 */
const ChildLeafTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(0, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
}));

/**
 * Render icon helper
 */
function renderIcon(icon?: React.ComponentType | React.ElementType | string) {
  if (!icon) return <DashboardIcon />;
  if (typeof icon === "string") return <span>{icon}</span>;
  const IconComponent = icon;
  return <IconComponent />;
}

/**
 * Main tree menu component
 */
export function TreeMenu({
  currentPath,
  onNavigate,
  rootRoute,
  appletSections,
  showDebugInfo = false,
  totalApplets = 0,
  searchTerm = "",
}: TreeMenuProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    ...appletSections.map((section) => `applet:${section.appletId}`),
    ...appletSections.flatMap(
      (section) => section.groups?.map((group) => `group:${group.id}`) || [],
    ),
  ]);

  // Auto-expand nodes when searching
  React.useEffect(() => {
    if (!searchTerm.trim()) return;

    const search = searchTerm.toLowerCase();
    const nodesToExpand = new Set<string>();

    appletSections.forEach((section) => {
      let hasMatchingContent = false;

      // Check if applet label matches
      if (section.appletLabel.toLowerCase().includes(search)) {
        hasMatchingContent = true;
      }

      // Check direct route
      if (section.directRoute?.label.toLowerCase().includes(search)) {
        hasMatchingContent = true;
      }

      // Check home route
      if (section.homeRoute?.label.toLowerCase().includes(search)) {
        hasMatchingContent = true;
      }

      // Check groups and their routes
      section.groups?.forEach((group) => {
        let groupHasMatches = false;

        // Check group label
        if (group.label.toLowerCase().includes(search)) {
          groupHasMatches = true;
          hasMatchingContent = true;
        }

        // Check routes in group
        group.routes.forEach((route) => {
          if (route.label.toLowerCase().includes(search)) {
            groupHasMatches = true;
            hasMatchingContent = true;
          }
        });

        // If group has matches, expand it
        if (groupHasMatches) {
          nodesToExpand.add(`group:${group.id}`);
        }
      });

      // If applet has matching content, expand it
      if (hasMatchingContent) {
        nodesToExpand.add(`applet:${section.appletId}`);
      }
    });

    // Update expanded items to include nodes with matches
    setExpandedItems((prev) => {
      const newExpanded = new Set([...prev, ...nodesToExpand]);
      return Array.from(newExpanded);
    });
  }, [searchTerm, appletSections]);

  const handleItemClick = (_event: React.SyntheticEvent, itemId: string) => {
    // Extract path from itemId (format: "path:/some/path")
    if (itemId.startsWith("path:")) {
      const path = itemId.substring(5);
      onNavigate(path);
    }
  };

  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent | null,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const renderExpandButton = (itemId: string, hasChildren: boolean) => {
    if (!hasChildren) return null;

    const isExpanded = expandedItems.includes(itemId);
    const Icon = isExpanded ? ExpandLess : ExpandMore;

    return (
      <Icon
        className="custom-expand-button"
        onClick={(e) => {
          e.stopPropagation();
          // Toggle the item in the expanded items array
          const newExpandedItems = isExpanded
            ? expandedItems.filter((id) => id !== itemId)
            : [...expandedItems, itemId];
          setExpandedItems(newExpandedItems);
        }}
      />
    );
  };

  // Generate tree items
  const renderTreeItems = () => {
    const items = [];

    // Root route
    if (rootRoute) {
      items.push(
        <CustomTreeItem
          key={`path:${rootRoute.path}`}
          itemId={`path:${rootRoute.path}`}
          label={
            <Box sx={{ display: "flex", alignItems: "center", py: 0 }}>
              <span>{rootRoute.label}</span>
              {showDebugInfo && (
                <Chip
                  label={totalApplets}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    height: 17,
                    "& .MuiChip-label": {
                      px: 1,
                      py: 0,
                      fontSize: "0.75rem",
                    },
                  }}
                />
              )}
              {renderExpandButton(`path:${rootRoute.path}`, false)}
            </Box>
          }
          slots={{
            icon: () => renderIcon(rootRoute.icon),
          }}
        />,
      );
    }

    // Applet sections
    appletSections.forEach((section) => {
      // Simple applet without internal navigation
      if (!section.hasInternalNavigation && section.directRoute) {
        items.push(
          <CustomTreeItem
            key={`path:${section.directRoute.path}`}
            itemId={`path:${section.directRoute.path}`}
            label={
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <span>{section.directRoute.label}</span>
                {renderExpandButton(`path:${section.directRoute.path}`, false)}
              </Box>
            }
            slots={{
              icon: () => renderIcon(section.directRoute?.icon),
            }}
          />,
        );
      } else {
        // Complex applet with internal navigation
        const hasAccessibleRoutes =
          section.homeRoute || (section.groups && section.groups.length > 0);
        if (!hasAccessibleRoutes) return;

        const children = [];

        // Home route
        if (section.homeRoute) {
          children.push(
            <LeafTreeItem
              key={`path:${section.homeRoute.path}`}
              itemId={`path:${section.homeRoute.path}`}
              label={
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <span>Home</span>
                  {renderExpandButton(`path:${section.homeRoute.path}`, false)}
                </Box>
              }
              slots={{
                icon: () => renderIcon(section.homeRoute?.icon || "🏠"),
              }}
            />,
          );
        }

        // Groups
        section.groups?.forEach((group) => {
          const groupChildren = group.routes.map((route) => (
            <ChildLeafTreeItem
              key={`path:${route.path}`}
              itemId={`path:${route.path}`}
              label={
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <span>{route.label}</span>
                  {renderExpandButton(`path:${route.path}`, false)}
                </Box>
              }
              slots={{
                icon: () => renderIcon(route.icon),
              }}
            />
          ));

          children.push(
            <CustomTreeItem
              key={`group:${group.id}`}
              itemId={`group:${group.id}`}
              label={
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <span>{group.label}</span>
                  {renderExpandButton(
                    `group:${group.id}`,
                    groupChildren.length > 0,
                  )}
                </Box>
              }
              slots={{
                icon: () => renderIcon(group.icon),
              }}
            >
              {groupChildren}
            </CustomTreeItem>,
          );
        });

        items.push(
          <CustomTreeItem
            key={`applet:${section.appletId}`}
            itemId={`applet:${section.appletId}`}
            label={
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <span>{section.appletLabel}</span>
                {renderExpandButton(
                  `applet:${section.appletId}`,
                  children.length > 0,
                )}
              </Box>
            }
            slots={{
              icon: () => renderIcon(section.appletIcon),
            }}
          >
            {children}
          </CustomTreeItem>,
        );
      }
    });

    return items;
  };

  // Find selected item based on current path
  const selectedItems = `path:${currentPath}`;

  return (
    <Box sx={{ minHeight: 180, flexGrow: 1, maxWidth: 300 }}>
      <SimpleTreeView
        selectedItems={selectedItems}
        onItemClick={handleItemClick}
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        sx={{
          overflowX: "hidden",
          minHeight: 270,
          flexGrow: 1,
          maxWidth: 300,
          paddingLeft: 2,
        }}
      >
        {renderTreeItems()}
      </SimpleTreeView>
    </Box>
  );
}
