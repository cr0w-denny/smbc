import React from "react";
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  useHashNavigation,
  type AppletMount,
} from "@smbc/applet-core";
import {
  useHostNavigation,
  useRoleManagement,
} from "@smbc/applet-host";
import { TreeMenu, type TreeMenuSection } from "@smbc/mui-components";

export interface AppletDrawerProps {
  applets: AppletMount[];
  constants: {
    drawerWidth: number;
    appName: string;
  };
  title?: string;
  permissionMapping?: Record<string, string>;
}

export function AppletDrawer({
  applets,
  constants,
  title,
  permissionMapping = {},
}: AppletDrawerProps) {
  const { path, navigate } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { rootRoute, menuSections } = useHostNavigation({
    applets,
    hasAnyPermission,
    permissionMapping,
    includeRootRoute: true,
    rootRoute: { path: "/", label: "Role Manager", icon: DashboardIcon },
    includeInternalRoutes: true,
  });

  // Filter sections based on search term
  const filteredSections = React.useMemo(() => {
    if (!searchTerm.trim()) return menuSections;

    const search = searchTerm.toLowerCase();
    const results: TreeMenuSection[] = [];

    menuSections.forEach((section) => {
      // Always include non-filterable sections completely unchanged
      // Check filterable property (defaulting to true if not specified)
      const isFilterable = section.filterable !== false;

      if (!isFilterable) {
        results.push(section); // Always include non-filterable sections unchanged
        return;
      }

      // For filterable sections, apply normal filtering logic
      // Check if section name matches
      const sectionMatches = section.sectionLabel
        .toLowerCase()
        .includes(search);

      // Filter groups and routes within groups
      const filteredGroups =
        section.groups
          ?.map((group) => {
            const groupMatches = group.label.toLowerCase().includes(search);
            const filteredRoutes = group.routes.filter((route) =>
              route.label.toLowerCase().includes(search),
            );

            // Include group if it matches or has matching routes
            if (groupMatches || filteredRoutes.length > 0) {
              return {
                ...group,
                routes: groupMatches ? group.routes : filteredRoutes,
              };
            }
            return null;
          })
          .filter(
            (group): group is NonNullable<typeof group> => group !== null,
          ) || [];

      // Check direct route
      const directRouteMatches = section.directRoute?.label
        .toLowerCase()
        .includes(search);
      const homeRouteMatches = section.homeRoute?.label
        .toLowerCase()
        .includes(search);

      // Include section if section matches, or has matching groups/routes
      if (
        sectionMatches ||
        filteredGroups.length > 0 ||
        directRouteMatches ||
        homeRouteMatches
      ) {
        results.push({
          ...section,
          groups:
            filteredGroups.length > 0
              ? filteredGroups
              : sectionMatches
                ? section.groups
                : [],
          directRoute:
            sectionMatches || directRouteMatches
              ? section.directRoute
              : undefined,
          homeRoute:
            sectionMatches || homeRouteMatches ? section.homeRoute : undefined,
        });
      }
    });

    // If no results and we have a search term, ensure non-filterable sections are still included
    if (results.length === 0 && searchTerm.trim()) {
      menuSections.forEach((section) => {
        const isFilterable = section.filterable !== false;
        if (!isFilterable) {
          results.push(section);
        }
      });
    }

    return results;
  }, [menuSections, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const searchInput = (
    <TextField
      fullWidth
      size="small"
      placeholder="Search applets..."
      value={searchTerm}
      onChange={handleSearchChange}
      sx={{ mb: 1, mt: 1 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );

  // Split sections into non-filterable and filterable
  const nonFilterableSections = menuSections.filter(
    (section) => section.filterable === false,
  );
  const filterableSections = filteredSections.filter(
    (section) => section.filterable !== false,
  );

  return (
    <Box
      sx={{
        width: constants.drawerWidth,
        height: "100vh", // Full viewport height
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        position: "fixed",
        top: 0, // Start from the very top
        left: 0,
        zIndex: 1000,
      }}
    >
      {/* Title */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{title || constants.appName}</Typography>
      </Box>

      {/* Non-filterable sections (Applet Guide) */}
      <Box sx={{ flexShrink: 0 }}>
        <TreeMenu
          currentPath={path}
          onNavigate={navigate}
          menuSections={nonFilterableSections}
          compact={true}
        />
      </Box>

      {/* Applet Store Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          mt: 1,
          color: "text.secondary",
          fontSize: "0.875rem",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ marginLeft: 10, marginRight: 8 }}>📱</span>
        Applet Store
      </Box>

      {/* Role Manager */}
      {rootRoute && (
        <Box sx={{ px: 2, py: 1 }}>
          <Box
            onClick={() => navigate(rootRoute.path)}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              py: 1,
              px: 1,
              borderRadius: 1,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {rootRoute.icon &&
              React.createElement(rootRoute.icon, {
                style: { marginRight: 8 },
              })}
            <Typography>{rootRoute.label}</Typography>
          </Box>
        </Box>
      )}

      {/* Search Input */}
      <Box sx={{ px: 2, mt: "-10px" }}>{searchInput}</Box>

      {/* Filterable sections (Applet Store items) */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <TreeMenu
          currentPath={path}
          onNavigate={navigate}
          menuSections={filterableSections}
        />
      </Box>
    </Box>
  );
}
