import React from "react";
import { Box, Typography, Paper, Button, Stack, Chip, Alert } from "@mui/material";

export const NavigationDemo: React.FC = () => {
  const currentUrl = window.location.hash;

  const exampleUrls = [
    {
      url: "#/hello/what-is-an-applet",
      description: "Navigate to 'What is an Applet?' page"
    },
    {
      url: "#/hello/try-it-out",
      description: "Navigate to interactive demo"
    },
    {
      url: "#/hello/try-it-out?name=John&color=purple&notifications=false",
      description: "Deep link with saved settings"
    },
    {
      url: "#/product-catalog?page=2&search=laptop",
      description: "External applet with pagination and search"
    },
    {
      url: "#/user-management/users/123/edit",
      description: "Deep link to edit specific user"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🧭 Hash-Based Navigation & Deep Linking
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Applets use hash-based navigation to enable bookmarkable URLs, browser integration, 
          and state persistence. Click the examples below to see it in action!
        </Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Current URL:
        </Typography>
        <Typography 
          component="code" 
          variant="body1" 
          sx={{ 
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100", 
            p: 1, 
            borderRadius: 1, 
            fontFamily: "monospace",
            display: "block",
            wordBreak: "break-all"
          }}
        >
          {window.location.origin}{currentUrl}
        </Typography>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Try These Navigation Examples:
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {exampleUrls.map((example, index) => (
          <Paper key={index} sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {example.description}
                </Typography>
                <Typography 
                  component="code" 
                  variant="body2" 
                  sx={{ 
                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100", 
                    p: 0.5, 
                    borderRadius: 0.5, 
                    fontFamily: "monospace",
                    fontSize: "0.8rem"
                  }}
                >
                  {example.url}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.location.hash = example.url}
                sx={{ minWidth: 120 }}
              >
                Navigate
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Paper sx={{ 
        p: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🎯 Key Benefits
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
          <Chip label="📱 Mobile-friendly URLs" size="small" color="success" variant="outlined" />
          <Chip label="🔗 Shareable links" size="small" color="success" variant="outlined" />
          <Chip label="🔄 Browser back/forward" size="small" color="success" variant="outlined" />
          <Chip label="💾 State persistence" size="small" color="success" variant="outlined" />
          <Chip label="🎯 Deep linking" size="small" color="success" variant="outlined" />
        </Stack>
        <Typography variant="body2">
          Hash navigation allows each applet to manage its own routing without conflicts, 
          while providing all the benefits of traditional web navigation.
        </Typography>
      </Paper>

      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🔧 Implementation Example
        </Typography>
        <Typography component="pre" variant="body2" sx={{ 
          fontFamily: "monospace", 
          backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
          color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900", 
          p: 2, 
          borderRadius: 1,
          overflow: "auto",
          fontSize: "0.85rem"
        }}>
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
// - Deep linking to any applet state

// Applet hook usage:
const { currentPath, navigateTo, canAccess } = useInternalNavigation({
  appletId: "hello",
  mountPath,
  routes,
  navigationGroups,
});`}
        </Typography>
      </Paper>
    </Box>
  );
};