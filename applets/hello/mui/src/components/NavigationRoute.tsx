import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export const NavigationRoute: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Hash Navigation in SMBC Applets
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph>
            SMBC applets use <strong>hash-based navigation</strong> to
            manage routing within and between applets. When you navigate
            between routes, notice how the URL changes to include hash
            fragments like <b>#/hello/route-one</b> or{" "}
            <b>#/user-management?page=2&search=john</b>.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Key Benefits
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>
                <strong>Deep Linking:</strong> Any application state can be
                bookmarked and shared via URL
              </li>
              <li>
                <strong>Browser Integration:</strong> Back/forward buttons
                work naturally across applet routes
              </li>
              <li>
                <strong>State Persistence:</strong> Filters, pagination, and
                form data survive page refreshes
              </li>
              <li>
                <strong>Applet Isolation:</strong> Each applet manages its
                own routing without conflicts
              </li>
              <li>
                <strong>Host Integration:</strong> Host applications can
                navigate to specific applet states programmatically
              </li>
            </ul>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Route Exposure Architecture
          </Typography>
          <Typography variant="body1" paragraph>
            Applets expose their internal navigation structure to host
            applications through the <b>getHostNavigation</b> export. This
            allows hosts to build navigation menus, breadcrumbs, and
            implement programmatic navigation while respecting
            permission-based route filtering.
          </Typography>

          <Typography component="div" variant="body1">
            <strong>Implementation Pattern:</strong>
            <Typography
              component="pre"
              variant="body2"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                p: 2,
                mt: 1,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.85rem",
                overflow: "auto",
              }}
            >
              {`// In applet: navigation.ts
export const getHostNavigation = createNavigationExport({
  groups: navigationGroups,
  routes: internalRoutes,
  homeRoute: { label: "Home", icon: "🏠" },
});

// Host can access:
// - Route definitions with permissions
// - Navigation groups for organization  
// - Dynamic route filtering based on user permissions
// - Deep linking to any applet state`}
            </Typography>
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
            💡 Try navigating between routes and observe how the URL hash
            changes. Open Route Two to see hash-based filter persistence in
            action.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};