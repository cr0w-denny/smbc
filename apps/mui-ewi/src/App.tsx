import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Typography, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "@smbc/mui-components";
import { ActivityNotifications } from "@smbc/mui-applet-core";
import { AuthGate } from "./components/AuthGate";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
import { useDebug, useDevTools } from "./context/DevContext";

// Enhanced fetch function that adds X-Impersonate header
const createFetchWithHeaders = (getImpersonationEmail: () => string) =>
  async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    // Add impersonate header if available from context
    const impersonateEmail = getImpersonationEmail();

    if (impersonateEmail) {
      headers.set('X-Impersonate', impersonateEmail);
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
          const url = typeof queryKey[0] === 'string' ? queryKey[0] : queryKey[0]?.toString();
          if (!url) throw new Error('Invalid query key');

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
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
const setupGlobalFetchInterceptor = (debug: any, createSessionId: any) => {
  console.log('🔧 setupGlobalFetchInterceptor called');
  debug.log(createSessionId('interceptor-setup'), 'GlobalFetchInterceptor', 'interceptor-setup', {
    originalFetchExists: typeof window.fetch === 'function'
  });

  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Read impersonation email from global variable (same as useApiClient)
    const impersonateEmail = (window as any).__devImpersonateEmail;
    const url = typeof input === 'string' ? input : input.toString();

    console.log('🌐 Fetch interceptor called for:', url);

    // Log all outgoing requests
    debug.log(createSessionId('fetch-request'), 'GlobalFetchInterceptor', 'request-made', {
      url,
      method: init?.method || 'GET',
      hasImpersonationEmail: Boolean(impersonateEmail),
      impersonationEmail: impersonateEmail || null,
      originalHeaders: init?.headers ? Object.fromEntries(new Headers(init.headers)) : {},
      timestamp: new Date().toISOString()
    });

    if (impersonateEmail) {
      // Clone and modify headers
      const headers = new Headers(init?.headers);
      headers.set('X-Impersonate', impersonateEmail);

      console.log('🌍 Global fetch interceptor adding X-Impersonate:', impersonateEmail);
      console.log('🌍 All headers after modification:', Object.fromEntries(headers));

      debug.log(createSessionId('impersonate-header'), 'GlobalFetchInterceptor', 'header-added', {
        url,
        impersonationEmail: impersonateEmail,
        finalHeaders: Object.fromEntries(headers),
        timestamp: new Date().toISOString()
      });

      // Call original fetch with modified headers
      return originalFetch(input, {
        ...init,
        headers,
      });
    } else {
      console.log('🔍 No impersonation email, calling original fetch unchanged');
      debug.log(createSessionId('no-impersonate'), 'GlobalFetchInterceptor', 'no-impersonation', {
        url,
        reason: 'No impersonation email set',
        timestamp: new Date().toISOString()
      });
    }

    // Call original fetch unchanged
    return originalFetch(input, init);
  };

  console.log('🔧 Global fetch interceptor installed successfully');
  debug.log(createSessionId('interceptor-ready'), 'GlobalFetchInterceptor', 'interceptor-ready', {
    message: 'Global fetch interceptor is now active',
    timestamp: new Date().toISOString()
  });
};

configureApplets(APPLETS);
console.log("🔄 Configured applets for mock environment");

const AppShellContent: React.FC = () => {
  const { path, navigate } = useHashNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { debug, createSessionId } = useDebug();
  const { DevConsoleToggle, roleSelection, impersonation, requestHeaders } = useDevTools();
  // Use role selection from DevContext
  const { userRoles, handleRoleToggle } = roleSelection;

  // Create query client with access to impersonation context
  const queryClient = React.useMemo(() => {
    return createQueryClient(() => impersonation.email);
  }, [impersonation.email]);

  // Setup global fetch interceptor once when DevContext is ready
  const [interceptorSetup, setInterceptorSetup] = React.useState(false);
  React.useEffect(() => {
    // Only setup once if dev tools are loaded and not already setup
    if (!interceptorSetup && impersonation.setEmail.toString() !== '() => {}') {
      console.log('🔧 Setting up fetch interceptor');
      setupGlobalFetchInterceptor(debug, createSessionId);
      setInterceptorSetup(true);
    }
  }, [interceptorSetup, impersonation.setEmail, debug, createSessionId]); // Minimal dependencies

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ewi-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);


  const handleDarkModeToggle = (enabled: boolean) => {
    debug.log(createSessionId('dark-mode-toggle'), 'UserActions', 'dark-mode-changed', {
      enabled,
      previousMode: isDarkMode
    });
    setIsDarkMode(enabled);
    localStorage.setItem("ewi-dark-mode", JSON.stringify(enabled));
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

  const appTheme = React.useMemo(() => createTheme(isDarkMode), [isDarkMode]);

  // Default component for unmatched routes
  const AppRoutes = () => {
    switch (path) {
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

  const maxWidthConfig = {
    xs: "96%",
    sm: "96%",
    md: "88%", // 6% margin on each side
    lg: "88%", // 6% margin on each side
    xl: "92%", // 4% margin on each side
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AppShell.Layout
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
          isImpersonating={impersonation.isImpersonating}
          right={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, "& .MuiIconButton-root svg": { fontSize: 28 } }}>
              <DevConsoleToggle
                applets={APPLETS}
                impersonationEmail={impersonation.email}
                onImpersonationEmailChange={impersonation.setEmail}
              />
              <ActivityNotifications onNavigate={navigate} />
            </Box>
          }
          maxWidth={maxWidthConfig}
        >
          <ErrorBoundary>
            <AppletRouter defaultComponent={AppRoutes} requestHeaders={requestHeaders} />
          </ErrorBoundary>
        </AppShell.Layout>
      </ThemeProvider>
    </QueryClientProvider>
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
      <AppContent />
    </AuthGate>
  );
};

export default App;
