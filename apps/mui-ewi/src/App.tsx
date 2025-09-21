import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import { AuthGate } from "./components/AuthGate";
import {
  useHashNavigation,
  AppletProvider,
  FeatureFlagProvider,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS } from "./applet.config";
import { createTheme } from "@smbc/mui-components";
import { navigation } from "./menu";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

configureApplets(APPLETS);
console.log("🔄 Configured applets for mock environment");

const AppShellContent: React.FC = () => {
  const { path, navigate } = useHashNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Define available roles and their permissions
  const availableRoles = [
    {
      id: "administrator",
      label: "Administrator",
      permissions: [
        "events:read",
        "events:write",
        "events:delete",
        "reports:all",
        "obligor:all",
      ],
    },
    {
      id: "analyst",
      label: "Risk Analyst",
      permissions: [
        "events:read",
        "events:write",
        "reports:read",
        "obligor:read",
      ],
    },
    {
      id: "compliance",
      label: "Compliance Officer",
      permissions: ["events:read", "reports:read", "obligor:read"],
    },
    { id: "viewer", label: "Report Viewer", permissions: ["reports:read"] },
    {
      id: "audit",
      label: "Internal Auditor",
      permissions: ["events:read", "reports:read", "obligor:read"],
    },
    {
      id: "manager",
      label: "Risk Manager",
      permissions: [
        "events:read",
        "events:write",
        "reports:all",
        "obligor:read",
      ],
    },
    {
      id: "senior-analyst",
      label: "Senior Risk Analyst",
      permissions: [
        "events:read",
        "events:write",
        "reports:all",
        "obligor:read",
      ],
    },
    {
      id: "credit-officer",
      label: "Credit Officer",
      permissions: ["events:read", "obligor:all"],
    },
    {
      id: "operations",
      label: "Operations Specialist",
      permissions: ["events:read", "events:write"],
    },
    {
      id: "supervisor",
      label: "Supervisor",
      permissions: ["events:read", "reports:read"],
    },
    {
      id: "regulatory",
      label: "Regulatory Affairs",
      permissions: ["events:read", "reports:read"],
    },
    {
      id: "data-scientist",
      label: "Data Scientist",
      permissions: ["events:read", "reports:all"],
    },
    {
      id: "portfolio-manager",
      label: "Portfolio Manager",
      permissions: ["events:read", "reports:read", "obligor:read"],
    },
    {
      id: "relationship-manager",
      label: "Relationship Manager",
      permissions: ["events:read", "obligor:read"],
    },
    {
      id: "treasury",
      label: "Treasury Analyst",
      permissions: ["reports:read"],
    },
    {
      id: "legal",
      label: "Legal Counsel",
      permissions: ["events:read", "reports:read"],
    },
    { id: "it-support", label: "IT Support", permissions: [] },
    { id: "executive", label: "Executive", permissions: ["reports:read"] },
  ];

  // Load persisted roles from localStorage
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ewi-user-roles");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load user roles from localStorage:", error);
    }
    // Default to analyst and viewer roles
    return ["analyst", "viewer"];
  });

  // Calculate user roles for the menu (format expected by UserMenu component)
  const userRoles = availableRoles.map((role) => ({
    id: role.id,
    label: role.label,
    enabled: selectedRoleIds.includes(role.id),
  }));

  // Calculate current permissions based on selected roles
  const _currentPermissions = React.useMemo(() => {
    const permissions = new Set<string>();
    selectedRoleIds.forEach((roleId) => {
      const role = availableRoles.find((r) => r.id === roleId);
      if (role) {
        role.permissions.forEach((permission) => permissions.add(permission));
      }
    });
    return Array.from(permissions);
  }, [selectedRoleIds]);

  // Persist role changes
  useEffect(() => {
    try {
      localStorage.setItem("ewi-user-roles", JSON.stringify(selectedRoleIds));
    } catch (error) {
      console.error("Failed to save user roles to localStorage:", error);
    }
  }, [selectedRoleIds]);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ewi-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem("ewi-dark-mode", JSON.stringify(enabled));
  };

  const handleRoleToggle = (roleId: string, enabled: boolean) => {
    setSelectedRoleIds((prev) => {
      const newRoles = enabled
        ? [...prev, roleId]
        : prev.filter((id) => id !== roleId);

      // Log the change and current permissions
      const role = availableRoles.find((r) => r.id === roleId);
      console.log(`Role ${role?.label} (${roleId}) toggled to:`, enabled);

      // Calculate new permissions
      const newPermissions = new Set<string>();
      newRoles.forEach((id) => {
        const r = availableRoles.find((role) => role.id === id);
        if (r) {
          r.permissions.forEach((permission) => newPermissions.add(permission));
        }
      });

      console.log("Current permissions:", Array.from(newPermissions));
      console.log(
        "Active roles:",
        newRoles
          .map((id) => availableRoles.find((r) => r.id === id)?.label)
          .filter(Boolean),
      );

      return newRoles;
    });
  };

  const handleProfile = () => {
    console.log("Profile clicked");
    // Navigate to profile page or show profile modal
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    // Navigate to settings page or show settings modal
  };

  const handleQuickGuide = () => {
    console.log("Quick Guide clicked");
    // Show quick guide modal or navigate to help
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Handle logout logic
    alert("Logout functionality would be implemented here");
  };

  // App theme - responds to dark mode toggle
  const appTheme = React.useMemo(() => createTheme(isDarkMode), [isDarkMode]);

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
      case "/monthly-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Monthly Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monthly reporting functionality coming soon...
            </Typography>
          </Box>
        );

      case "/annual-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Annual Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Annual reporting functionality coming soon...
            </Typography>
          </Box>
        );

      case "/subscription-managers":
        return (
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
            <Typography variant="h4" gutterBottom>
              Subscription Managers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Subscription management functionality coming soon...
            </Typography>
          </Box>
        );

      case "/custom-reports":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Custom Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Custom reporting functionality coming soon...
            </Typography>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to EWI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a page from the navigation to get started.
            </Typography>
          </Box>
        );
    }
  };

  const maxWidthConfig = {
    xs: "96%",
    sm: "96%",
    md: "88%", // 6% margin on each side
    lg: "88%", // 6% margin on each side
    xl: "92%", // 4% margin on each side
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppShell
        logo={
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="EWI Logo"
            style={{ height: 60 }}
          />
        }
        navigation={navigation}
        onNavigate={navigate}
        currentPath={path}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        username="John Doe"
        theme={appTheme}
        userRoles={userRoles}
        onToggleRole={handleRoleToggle}
        onProfile={handleProfile}
        onSettings={handleSettings}
        onQuickGuide={handleQuickGuide}
        onLogout={handleLogout}
        right={
          <Box sx={{ "& .MuiIconButton-root svg": { fontSize: 28 } }}>
            <ActivityNotifications onNavigate={navigate} />
          </Box>
        }
        maxWidth={maxWidthConfig}
      >
        <AppletRouter defaultComponent={AppRoutes} />
      </AppShell>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  return (
    <AppletProvider applets={APPLETS}>
      <FeatureFlagProvider
        configs={[
          {
            key: "environment",
            defaultValue: "mock",
          },
        ]}
      >
        <DataViewProvider>
          <AppShellContent />
        </DataViewProvider>
      </FeatureFlagProvider>
    </AppletProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthGate>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthGate>
  );
};

export default App;
