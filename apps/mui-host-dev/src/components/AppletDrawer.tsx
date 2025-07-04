import React from "react";
import { Dashboard as DashboardIcon, Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import {
  useHashNavigation,
  useHostNavigation,
  useRoleManagement,
  type AppletMount,
} from "@smbc/applet-core";
import {
  AppletDrawer as BaseAppletDrawer,
  type NavigationRoute,
  type HierarchicalNavigationSection,
} from "@smbc/mui-components";

interface AppletDrawerProps {
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
  const { currentPath, navigateTo } = useHashNavigation();
  const { hasAnyPermission } = useRoleManagement();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const { rootRoute, appletSections } = useHostNavigation({
    applets,
    hasAnyPermission,
    permissionMapping,
    includeRootRoute: true,
    rootRoute: { path: "/", label: "Dashboard", icon: DashboardIcon },
    includeInternalRoutes: true
  });

  // Filter sections based on search term
  const filteredSections = React.useMemo(() => {
    if (!searchTerm.trim()) return appletSections;

    const search = searchTerm.toLowerCase();
    
    return appletSections.map(section => {
      // Check if applet name matches
      const appletMatches = section.appletLabel.toLowerCase().includes(search);
      
      // Filter groups and routes within groups
      const filteredGroups = section.groups?.map(group => {
        const groupMatches = group.label.toLowerCase().includes(search);
        const filteredRoutes = group.routes.filter(route => 
          route.label.toLowerCase().includes(search)
        );
        
        // Include group if it matches or has matching routes
        if (groupMatches || filteredRoutes.length > 0) {
          return {
            ...group,
            routes: groupMatches ? group.routes : filteredRoutes
          };
        }
        return null;
      }).filter(Boolean) || [];

      // Check direct route
      const directRouteMatches = section.directRoute?.label.toLowerCase().includes(search);
      const homeRouteMatches = section.homeRoute?.label.toLowerCase().includes(search);

      // Include section if applet matches, or has matching groups/routes
      if (appletMatches || filteredGroups.length > 0 || directRouteMatches || homeRouteMatches) {
        return {
          ...section,
          groups: filteredGroups.length > 0 ? filteredGroups : (appletMatches ? section.groups : []),
          directRoute: (appletMatches || directRouteMatches) ? section.directRoute : undefined,
          homeRoute: (appletMatches || homeRouteMatches) ? section.homeRoute : undefined,
        };
      }
      
      return null;
    }).filter(Boolean) as HierarchicalNavigationSection[];
  }, [appletSections, searchTerm]);

  // Convert types to match BaseAppletDrawer expectations
  const hierarchicalSections = React.useMemo(() => 
    filteredSections.map(section => ({
      ...section,
      groups: section.groups?.map(group => ({
        ...group,
        routes: group.routes.map(route => ({
          ...route,
          icon: typeof route.icon === 'string' 
            ? () => <span>{route.icon}</span>
            : route.icon,
        }))
      })),
      directRoute: section.directRoute ? {
        ...section.directRoute,
        icon: typeof section.directRoute.icon === 'string' 
          ? () => <span>{section.directRoute.icon}</span>
          : section.directRoute.icon,
      } : undefined,
      homeRoute: section.homeRoute ? {
        ...section.homeRoute,
        icon: typeof section.homeRoute.icon === 'string' 
          ? () => <span>{section.homeRoute.icon}</span>
          : section.homeRoute.icon,
      } : undefined,
    })), 
    [filteredSections]
  );

  const convertedRootRoute = React.useMemo(() => 
    rootRoute ? {
      ...rootRoute,
      icon: typeof rootRoute.icon === 'string' 
        ? () => <span>{rootRoute.icon}</span>
        : rootRoute.icon,
    } : undefined, 
    [rootRoute]
  );

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
      sx={{ mb: 1 }}
      InputProps={{
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
      }}
    />
  );

  return (
    <BaseAppletDrawer
      title={title || constants.appName}
      width={constants.drawerWidth}
      currentPath={currentPath}
      onNavigate={navigateTo}
      rootRoute={convertedRootRoute}
      appletSections={hierarchicalSections}
      showDebugInfo={true}
      totalApplets={applets.length}
      headerContent={searchInput}
      searchTerm={searchTerm}
    />
  );
}
