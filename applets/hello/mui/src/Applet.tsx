import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { Filter } from "@smbc/mui-components";
import { useInternalNavigation, useHashParams } from "@smbc/applet-core";
import { navigationGroups, internalRoutes } from "./navigation";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

// Add display properties for internal rendering
const routes = internalRoutes.map((route) => ({
  ...route,
  emoji: route.icon, // Use icon as emoji for display
  title: `${route.label} - ${route.icon}`,
}));

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  // Filter state persists at applet level across route navigation
  const { filters: filterValues, setFilters: setFilterValues } = useHashParams(
    {
      search: "",
      status: "",
      priority: "",
      assignee: "",
      category: "",
    },
    {}, // No pagination needed for this demo
  );

  const {
    currentPath,
    navigateTo,
    allowedRoutes,
    currentRoute,
    canAccess,
    hasAnyAccess,
    hostNavigationGroups,
  } = useInternalNavigation({
    appletId: "hello",
    mountPath,
    routes,
    navigationGroups,
  });

  // Clear filter state when user navigates away from route-two
  React.useEffect(() => {
    if (currentPath !== "/route-two") {
      setFilterValues({
        search: "",
        status: "",
        priority: "",
        assignee: "",
        category: "",
      });
    }
  }, [currentPath, setFilterValues]);

  // Demo: Log navigation groups for host consumption
  console.log("Host Navigation Groups:", hostNavigationGroups);

  const renderContent = () => {
    // Filter Demo for route-two
    if (currentPath === "/route-two" && canAccess(currentPath)) {
      return (
        <Box sx={{ mt: 4 }}>
          <Filter
            spec={{
              fields: [
                {
                  name: "search",
                  label: "Search",
                  type: "search",
                  placeholder: "Search anything...",
                  fullWidth: true,
                },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: [
                    { label: "All", value: "" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Pending", value: "pending" },
                  ],
                },
                {
                  name: "priority",
                  label: "Priority",
                  type: "select",
                  options: [
                    { label: "Any", value: "" },
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ],
                },
                {
                  name: "assignee",
                  label: "Assignee",
                  type: "text",
                  placeholder: "Enter assignee name",
                },
                {
                  name: "category",
                  label: "Category",
                  type: "select",
                  options: [
                    { label: "All Categories", value: "" },
                    { label: "Development", value: "dev" },
                    { label: "Design", value: "design" },
                    { label: "Marketing", value: "marketing" },
                    { label: "Sales", value: "sales" },
                  ],
                },
              ],
              initialValues: {
                search: "",
                status: "",
                priority: "",
                assignee: "",
                category: "",
              },
              title: "Demo Filters",
            }}
            onFiltersChange={setFilterValues}
            values={filterValues}
          />

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Filter Values:
              </Typography>
              <Typography
                component="pre"
                variant="body2"
                sx={{
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                  color: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(filterValues, null, 2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
                Notice how the URL hash updates as you change filter values
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Check if we have a current route and can access it
    if (currentRoute && canAccess(currentPath)) {
      return (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h1" sx={{ fontSize: "10rem" }}>
            {currentRoute.emoji}
          </Typography>
          <Typography variant="h4">{currentRoute.title}</Typography>
        </Box>
      );
    }

    // Access denied for current route
    if (currentRoute && !canAccess(currentPath)) {
      return (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h4" color="error">
            🚫 Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to view {currentRoute.label}
          </Typography>
        </Box>
      );
    }

    // Default welcome screen
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h1" sx={{ fontSize: "10rem" }}>
          👋
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Select a route above to see different views
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "center" }}
      >
        {allowedRoutes.map((route) => (
          <Button
            key={route.path}
            variant="contained"
            onClick={() => navigateTo(route.path)}
            color={currentPath === route.path ? "secondary" : "primary"}
            size="large"
          >
            {route.icon} {route.label}
          </Button>
        ))}
        {!hasAnyAccess && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            No routes available with your current permissions
          </Typography>
        )}
      </Stack>

      {renderContent()}
    </Box>
  );
};
