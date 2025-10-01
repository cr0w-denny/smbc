import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { color } from "@smbc/ui-core";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import { ErrorBoundary } from "./components/ErrorBoundary";

import {
  AppletProvider,
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagToggle,
  useHashNavigation,
} from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { AuthGate } from "./components/AuthGate";
import { configureApplets, AppletRouter } from "@smbc/applet-host";
import { APPLETS, ROLE_CONFIG } from "./applet.config";
import { createCssVarTheme } from "@smbc/mui-components";
import { navigation } from "./menu";
import { useDebug, useDevTools, DevProvider } from "./context/DevContext";
import { DevConsoleToggle } from "@smbc/mui-applet-devtools";

// Enhanced fetch function that adds X-Impersonate header
const createFetchWithHeaders =
  (getImpersonationEmail: () => string) =>
  async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    // Add impersonate header if available from context
    const impersonateEmail = getImpersonationEmail();

    if (impersonateEmail) {
      headers.set("X-Impersonate", impersonateEmail);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

// Create query client factory to accept impersonation function
const createQueryClient = (getImpersonationEmail: () => string) => {
  const fetchWithHeaders = createFetchWithHeaders(getImpersonationEmail);

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        // Custom queryFn that automatically adds headers
        queryFn: async ({ queryKey, signal }) => {
          const url =
            typeof queryKey[0] === "string"
              ? queryKey[0]
              : queryKey[0]?.toString();
          if (!url) throw new Error("Invalid query key");

          const response = await fetchWithHeaders(url, { signal });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response.json();
        },
      },
      mutations: {
        // Custom mutationFn that automatically adds headers
        mutationFn: async (variables: any) => {
          const { url, options = {} } = variables;

          const response = await fetchWithHeaders(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            ...options,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response.json();
        },
      },
    },
  });
};

// Setup global fetch interceptor with context access
const setupGlobalFetchInterceptor = () => {
  console.log("🔧 setupGlobalFetchInterceptor called");
  // debug.log(
  //   createSessionId("interceptor-setup"),
  //   "GlobalFetchInterceptor",
  //   "interceptor-setup",
  //   {
  //     originalFetchExists: typeof window.fetch === "function",
  //   },
  // );

  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Read impersonation email from global variable (same as useApiClient)
    const impersonateEmail = (window as any).__devImpersonateEmail;

    // console.log("🌐 Fetch interceptor called for:", url);

    // Log all outgoing requests
    // debug.log(
    //   createSessionId("fetch-request"),
    //   "GlobalFetchInterceptor",
    //   "request-made",
    //   {
    //     url,
    //     method: init?.method || "GET",
    //     hasImpersonationEmail: Boolean(impersonateEmail),
    //     impersonationEmail: impersonateEmail || null,
    //     originalHeaders: init?.headers
    //       ? Object.fromEntries(new Headers(init.headers))
    //       : {},
    //     timestamp: new Date().toISOString(),
    //   },
    // );

    if (impersonateEmail) {
      // Clone and modify headers
      const headers = new Headers(init?.headers);
      headers.set("X-Impersonate", impersonateEmail);

      console.log(
        "🌍 Global fetch interceptor adding X-Impersonate:",
        impersonateEmail,
      );
      console.log(
        "🌍 All headers after modification:",
        Object.fromEntries(headers),
      );

      // debug.log(
      //   createSessionId("impersonate-header"),
      //   "GlobalFetchInterceptor",
      //   "header-added",
      //   {
      //     url,
      //     impersonationEmail: impersonateEmail,
      //     finalHeaders: Object.fromEntries(headers),
      //     timestamp: new Date().toISOString(),
      //   },
      // );

      // Call original fetch with modified headers
      return originalFetch(input, {
        ...init,
        headers,
      });
    } else {
      console.log(
        "🔍 No impersonation email, calling original fetch unchanged",
      );
      // debug.log(
      //   createSessionId("no-impersonate"),
      //   "GlobalFetchInterceptor",
      //   "no-impersonation",
      //   {
      //     url,
      //     reason: "No impersonation email set",
      //     timestamp: new Date().toISOString(),
      //   },
      // );
    }

    // Call original fetch unchanged
    return originalFetch(input, init);
  };

  console.log("🔧 Global fetch interceptor installed successfully");
  // debug.log(
  //   createSessionId("interceptor-ready"),
  //   "GlobalFetchInterceptor",
  //   "interceptor-ready",
  //   {
  //     message: "Global fetch interceptor is now active",
  //     timestamp: new Date().toISOString(),
  //   },
  // );
};

configureApplets(APPLETS);
console.log("🔄 Configured applets for mock environment");

const AppShellContent: React.FC = () => {
  const { path, navigate } = useHashNavigation();
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const { debug, createSessionId } = useDebug();

  // Debug logging for dark mode
  console.log('🌙 Dark mode debug:');
  console.log('isDarkMode value:', isDarkMode);
  console.log('typeof isDarkMode:', typeof isDarkMode);
  console.log('localStorage featureFlag-darkMode:', localStorage.getItem('featureFlag-darkMode'));
  console.log('localStorage raw access:', localStorage['featureFlag-darkMode']);
  console.log('Current data-theme attribute:', document.documentElement.getAttribute('data-theme'));

  // Override setAttribute to catch who's setting data-theme
  React.useEffect(() => {
    const originalSetAttribute = document.documentElement.setAttribute;
    document.documentElement.setAttribute = function(name: string, value: string) {
      if (name === 'data-theme') {
        console.log('🔍 setAttribute called for data-theme:', value);
        console.trace('Stack trace for setAttribute call:');

        // Check if system prefers dark mode
        console.log('System prefers-color-scheme:', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
      return originalSetAttribute.call(this, name, value);
    };

    return () => {
      document.documentElement.setAttribute = originalSetAttribute;
    };
  }, []);

  // Enhanced dark mode effect with debugging
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    console.log('🎨 Setting data-theme to:', theme, 'based on isDarkMode:', isDarkMode);
    document.documentElement.setAttribute("data-theme", theme);
  }, [isDarkMode]);

  const {
    DevConsoleToggle: _,
    roleSelection,
    impersonation,
    requestHeaders,
  } = useDevTools();

  const { userRoles, handleRoleToggle } = roleSelection;

  // Create query client with access to impersonation context
  const queryClient = React.useMemo(() => {
    return createQueryClient(() => impersonation.email);
  }, [impersonation.email]);

  // Setup global fetch interceptor once when DevContext is ready
  const [interceptorSetup, setInterceptorSetup] = React.useState(false);
  React.useEffect(() => {
    // Only setup once if dev tools are loaded and not already setup
    if (!interceptorSetup && impersonation.setEmail.toString() !== "() => {}") {
      console.log("🔧 Setting up fetch interceptor");
      setupGlobalFetchInterceptor();
      setInterceptorSetup(true);
    }
  }, [interceptorSetup, impersonation.setEmail, debug, createSessionId]);

  const handleDarkModeToggle = (enabled: boolean) => {
    toggleDarkMode();
  };

  // Custom right content with dev tools
  const rightContent = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        "& .MuiIconButton-root svg": { fontSize: 28 },
      }}
    >
      <DevConsoleToggle
        applets={APPLETS}
        impersonationEmail={impersonation.email}
        onImpersonationEmailChange={impersonation.setEmail}
      />
      <ActivityNotifications onNavigate={navigate} />
    </Box>
  );

  const username = impersonation.email ? (
    <span style={{ color: color.brand.freshGreen }}>
      {impersonation.email}
    </span>
  ) : (
    "John Doe"
  );

  // Create theme based on current mode
  const theme = React.useMemo(() => createCssVarTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  const maxWidthConfig = {
    xs: "96%",
    sm: "96%",
    md: "88%", // 6% margin on each side
    lg: "88%", // 6% margin on each side
    xl: "92%", // 4% margin on each side
  };

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
      case "/approvals":
        return (
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
            <Typography variant="h4" gutterBottom>
              Event Workflow Approvals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Event eorkflow approval functionality coming soon...
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
          <Box sx={{ p: 3, mt: 14, ml: 11 }}>
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppShell.Layout
          logo={
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="EWI Logo"
              style={{ height: 60, cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          }
          navigation={navigation}
          onNavigate={navigate}
          currentPath={path}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          username={username}
          userRoles={userRoles}
          onToggleRole={handleRoleToggle}
          onProfile={() => console.log("Profile clicked")}
          onSettings={() => console.log("Settings clicked")}
          onQuickGuide={() => console.log("Quick Guide clicked")}
          onLogout={() => {
            console.log("Logout clicked");
            alert("Logout functionality would be implemented here");
          }}
          isImpersonating={impersonation.isImpersonating}
          right={rightContent}
          maxWidth={maxWidthConfig}
        >
          <ErrorBoundary>
            <AppletRouter
              defaultComponent={AppRoutes}
              requestHeaders={requestHeaders}
            />
          </ErrorBoundary>
        </AppShell.Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const AppContent: React.FC = () => {
  const initialUser = {
    id: "1",
    email: "analyst@example.com",
    name: "Development User",
    roles: ["Analyst"],
  };

  return (
    <AppletProvider
      applets={APPLETS}
      initialRoleConfig={ROLE_CONFIG}
      initialUser={initialUser}
    >
      <FeatureFlagProvider
        configs={[
          {
            key: "environment",
            defaultValue: "mock",
          },
          {
            key: "darkMode",
            defaultValue: false,
            persist: true,
          },
        ]}
      >
        <DataViewProvider>
          <DevProvider>
            <AppShellContent />
          </DevProvider>
        </DataViewProvider>
      </FeatureFlagProvider>
    </AppletProvider>
  );
};

const DevApp: React.FC = () => {
  return (
    <AuthGate>
      <AppContent />
    </AuthGate>
  );
};

export default DevApp;
