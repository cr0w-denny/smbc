import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
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
  icon?: React.ComponentType | React.ElementType | string;
  component?: React.ComponentType;
  requiredPermissions?: string[];
}

/**
 * Tree menu navigation interfaces
 */
export interface TreeMenuGroup {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  routes: NavigationRoute[];
}

export interface TreeMenuSection {
  sectionId: string;
  sectionLabel: string;
  sectionIcon?: React.ComponentType | React.ElementType | string;
  sectionVersion?: string;
  hasInternalNavigation: boolean;
  directRoute?: NavigationRoute;
  homeRoute?: NavigationRoute;
  groups?: TreeMenuGroup[];
  filterable?: boolean;
}

export interface TreeMenuHeader {
  id: string;
  label: string;
  icon?: string;
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
  /** Tree menu sections */
  menuSections: TreeMenuSection[];
  /** Optional headers to display between sections */
  headers?: TreeMenuHeader[];
  /** Whether to show debug info (section count chip) */
  showDebugInfo?: boolean;
  /** Number of total sections for debug display */
  totalSections?: number;
  /** Current search term for auto-expanding matching nodes */
  searchTerm?: string;
  /** Search input component to render after headers */
  searchInput?: React.ReactNode;
  /** Whether to use compact layout without minHeight constraints */
  compact?: boolean;
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
  // Reduce padding when no icon is present
  "&.no-icon": {
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(1),
    },
  },
}));

/**
 * Leaf TreeItem (reduced padding)
 */
const LeafTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {},
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  // Reduce padding when no icon is present
  "&.no-icon": {
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(1),
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
  // Reduce padding when no icon is present
  "&.no-icon": {
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(1),
    },
  },
}));

/**
 * Render icon helper
 */
function renderIcon(icon?: React.ComponentType | React.ElementType | string) {
  if (!icon) return null;
  if (typeof icon === "string") return <span>{icon}</span>;
  const IconComponent = icon;
  return <IconComponent />;
}

/**
 * Render label with muted version text
 */
function renderLabelWithVersion(label: string, version?: string) {
  if (version) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <span>{label}</span>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.65rem",
            opacity: 0.7,
            fontWeight: 400,
          }}
        >
          v{version}
        </Typography>
      </Box>
    );
  }
  
  return <span>{label}</span>;
}

/**
 * Main tree menu component
 */
export function TreeMenu({
  currentPath,
  onNavigate,
  rootRoute,
  menuSections,
  headers = [],
  showDebugInfo = false,
  totalSections = 0,
  searchTerm = "",
  searchInput,
  compact = false,
}: TreeMenuProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Auto-expand section that contains the current path
  React.useEffect(() => {
    if (!currentPath) return;

    const itemsToExpand = new Set<string>();
    
    // Find which section contains the current path
    menuSections.forEach((section) => {
      let shouldExpandSection = false;
      
      // Check if current path matches direct route
      if (section.directRoute?.path === currentPath) {
        shouldExpandSection = true;
      }
      
      // Check if current path matches home route
      if (section.homeRoute?.path === currentPath) {
        shouldExpandSection = true;
      }
      
      // Check groups and their routes
      section.groups?.forEach((group) => {
        let shouldExpandGroup = false;
        
        group.routes.forEach((route) => {
          if (route.path === currentPath) {
            shouldExpandSection = true;
            shouldExpandGroup = true;
          }
        });
        
        if (shouldExpandGroup) {
          itemsToExpand.add(`group:${group.id}`);
        }
      });
      
      if (shouldExpandSection) {
        itemsToExpand.add(`section:${section.sectionId}`);
      }
    });

    if (itemsToExpand.size > 0) {
      setExpandedItems((prev) => {
        const newExpanded = new Set([...prev, ...itemsToExpand]);
        return Array.from(newExpanded);
      });
    }
  }, [currentPath, menuSections]);

  // Auto-expand nodes when searching (but don't expand non-filterable sections)
  React.useEffect(() => {
    if (!searchTerm.trim()) return;

    const search = searchTerm.toLowerCase();
    const nodesToExpand = new Set<string>();

    menuSections.forEach((section) => {
      let hasMatchingContent = false;

      // Check if applet label matches
      if (section.sectionLabel.toLowerCase().includes(search)) {
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

      // Only expand sections that have actual matches AND are filterable
      // Non-filterable sections should not auto-expand during search
      if (hasMatchingContent && section.filterable !== false) {
        nodesToExpand.add(`section:${section.sectionId}`);
      }
    });

    // Update expanded items to include nodes with matches
    setExpandedItems((prev) => {
      const newExpanded = new Set([...prev, ...nodesToExpand]);
      return Array.from(newExpanded);
    });
  }, [searchTerm, menuSections]);

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

  // Render a header item
  const renderHeader = (header: TreeMenuHeader) => (
    <Box
      key={`header:${header.id}`}
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        alignItems: "center",
        color: "text.secondary",
        fontSize: "0.875rem",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "1px solid",
        borderColor: "divider",
        mb: 1,
        mt: 2,
      }}
    >
      {header.icon && <span style={{ marginRight: 8 }}>{header.icon}</span>}
      {header.label}
    </Box>
  );

  // Generate tree items
  const renderTreeItems = () => {
    const items: JSX.Element[] = [];
    let headerAndSearchAdded = false;

    // Applet sections
    menuSections.forEach((section, index) => {
      // After the first section (hello applet), add root route and applet store header
      if (index === 1 && !headerAndSearchAdded) {
        // Add root route after hello applet
        if (rootRoute) {
          items.push(
            <CustomTreeItem
              key={`path:${rootRoute.path}`}
              itemId={`path:${rootRoute.path}`}
              className={!rootRoute.icon ? "no-icon" : ""}
              label={
                <Box sx={{ display: "flex", alignItems: "center", py: 0 }}>
                  <span>{rootRoute.label}</span>
                  {showDebugInfo && (
                    <Chip
                      label={totalSections}
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
              slots={rootRoute.icon ? {
                icon: () => renderIcon(rootRoute.icon),
              } : {}}
            />,
          );
        }

        // Insert "Applet Store" header
        if (headers.length > 0) {
          items.push(renderHeader(headers[0]));
          // Add search input after the header
          if (searchInput) {
            items.push(
              <Box key="search-input" sx={{ px: 0, py: 0 }}>
                {searchInput}
              </Box>
            );
          }
        }
        headerAndSearchAdded = true;
      }
      // Simple applet without internal navigation
      if (!section.hasInternalNavigation && section.directRoute) {
        items.push(
          <CustomTreeItem
            key={`path:${section.directRoute.path}`}
            itemId={`path:${section.directRoute.path}`}
            className={!section.directRoute?.icon ? "no-icon" : ""}
            label={
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                {renderLabelWithVersion(section.directRoute.label, section.sectionVersion)}
                {renderExpandButton(`path:${section.directRoute.path}`, false)}
              </Box>
            }
            slots={section.directRoute?.icon ? {
              icon: () => renderIcon(section.directRoute?.icon),
            } : {}}
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
              className={!section.homeRoute?.icon ? "no-icon" : ""}
              label={
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <span>{section.homeRoute.label}</span>
                  {renderExpandButton(`path:${section.homeRoute.path}`, false)}
                </Box>
              }
              slots={{
                icon: () => renderIcon(section.homeRoute?.icon || "🏠"),
              }}
            />,
          );
        }

        // Groups - Special handling for flat navigation (single group with empty label)
        if (section.groups?.length === 1 && section.groups[0].label === '') {
          // Flat navigation: render routes directly without group wrapper
          const flatGroup = section.groups[0];
          flatGroup.routes.forEach((route) => {
            children.push(
              <LeafTreeItem
                key={`path:${route.path}`}
                itemId={`path:${route.path}`}
                className={!route.icon ? "no-icon" : ""}
                label={
                  <Box
                    sx={{ display: "flex", alignItems: "center", width: "100%" }}
                  >
                    {renderLabelWithVersion(route.label)}
                    {renderExpandButton(`path:${route.path}`, false)}
                  </Box>
                }
                slots={route.icon ? {
                  icon: () => renderIcon(route.icon),
                } : {}}
              />
            );
          });
        } else {
          // Regular grouped navigation
          section.groups?.forEach((group) => {
            const groupChildren = group.routes.map((route) => (
              <ChildLeafTreeItem
                key={`path:${route.path}`}
                itemId={`path:${route.path}`}
                className={!route.icon ? "no-icon" : ""}
                label={
                  <Box
                    sx={{ display: "flex", alignItems: "center", width: "100%" }}
                  >
                    {renderLabelWithVersion(route.label)}
                    {renderExpandButton(`path:${route.path}`, false)}
                  </Box>
                }
                slots={route.icon ? {
                  icon: () => renderIcon(route.icon),
                } : {}}
              />
            ));

            children.push(
              <CustomTreeItem
                key={`group:${group.id}`}
                itemId={`group:${group.id}`}
                className={!group.icon ? "no-icon" : ""}
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
                slots={group.icon ? {
                  icon: () => renderIcon(group.icon),
                } : {}}
              >
                {groupChildren}
              </CustomTreeItem>,
            );
          });
        }

        items.push(
          <CustomTreeItem
            key={`section:${section.sectionId}`}
            itemId={`section:${section.sectionId}`}
            className={!section.sectionIcon ? "no-icon" : ""}
            label={
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                {renderLabelWithVersion(section.sectionLabel, section.sectionVersion)}
                {renderExpandButton(
                  `section:${section.sectionId}`,
                  children.length > 0,
                )}
              </Box>
            }
            slots={section.sectionIcon ? {
              icon: () => renderIcon(section.sectionIcon),
            } : {}}
          >
            {children}
          </CustomTreeItem>,
        );
      }
    });

    // Ensure search input is always rendered if it exists and we have headers, 
    // even if it wasn't added during the normal loop (e.g., when only hello section is visible)
    if (searchInput && headers.length > 0 && !headerAndSearchAdded) {
      if (rootRoute) {
        items.push(
          <CustomTreeItem
            key={`path:${rootRoute.path}`}
            itemId={`path:${rootRoute.path}`}
            className={!rootRoute.icon ? "no-icon" : ""}
            label={
              <Box sx={{ display: "flex", alignItems: "center", py: 0 }}>
                <span>{rootRoute.label}</span>
                {showDebugInfo && (
                  <Chip
                    label={totalSections}
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
            slots={rootRoute.icon ? {
              icon: () => renderIcon(rootRoute.icon),
            } : {}}
          />,
        );
      }
      items.push(renderHeader(headers[0]));
      items.push(
        <Box key="search-input" sx={{ px: 0, py: 0 }}>
          {searchInput}
        </Box>
      );
    }

    return items;
  };

  // Find selected item based on current path
  const selectedItems = `path:${currentPath}`;

  // Check if this is just a root route without other sections
  const isRootRouteOnly = rootRoute && menuSections.length === 0;

  return (
    <Box sx={{ 
      minHeight: compact || isRootRouteOnly ? "auto" : 180, 
      flexGrow: compact || isRootRouteOnly ? 0 : 1, 
      maxWidth: 300 
    }}>
      <SimpleTreeView
        selectedItems={selectedItems}
        onItemClick={handleItemClick}
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        sx={{
          overflowX: "hidden",
          minHeight: compact || isRootRouteOnly ? "auto" : 270,
          flexGrow: compact || isRootRouteOnly ? 0 : 1,
          maxWidth: 300,
          paddingLeft: isRootRouteOnly ? 0 : 2,
        }}
      >
        {renderTreeItems()}
      </SimpleTreeView>
    </Box>
  );
}
