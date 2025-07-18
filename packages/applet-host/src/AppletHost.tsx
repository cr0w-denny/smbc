import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  FeatureFlagProvider, 
  AppletProvider, 
  configureApplets,
  type FeatureFlagConfig,
  type User,
  type RoleConfig,
  type NavigationItem,
  type AppletMount
} from '@smbc/applet-core';

interface AppletHostProps {
  /** Child components to render */
  children: React.ReactNode;
  
  /** Applet configurations */
  applets: AppletMount[];
  
  /** Feature flag configurations */
  featureFlags?: FeatureFlagConfig[];
  
  /** Initial user data */
  initialUser?: User | null;
  
  /** Initial navigation items */
  initialNavigation?: NavigationItem[];
  
  /** Role configuration */
  initialRoleConfig?: RoleConfig;
  
  /** Custom QueryClient instance */
  queryClient?: QueryClient;
  
  /** Storage prefix for feature flags */
  storagePrefix?: string;
}

// Default feature flags that most applets expect
const defaultFeatureFlags: FeatureFlagConfig[] = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "mockData", 
    defaultValue: false,
    description: "Use mock data instead of real API endpoints",
    persist: true,
  },
];

// Default QueryClient with good defaults
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
    },
  },
});

/**
 * AppletHost provides all the necessary context providers for SMBC applets
 * in the correct nesting order. This includes feature flags, query client, 
 * and applet core context.
 */
export function AppletHost({
  children,
  applets,
  featureFlags = defaultFeatureFlags,
  initialUser = null,
  initialNavigation = [],
  initialRoleConfig = { roles: ["Guest", "User"], permissionMappings: {} },
  queryClient = defaultQueryClient,
  storagePrefix = "smbcApplet",
}: AppletHostProps) {
  // Configure applets for the query client
  React.useEffect(() => {
    configureApplets(applets);
  }, [applets]);

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider configs={featureFlags} storagePrefix={storagePrefix}>
        <AppletProvider
          initialUser={initialUser}
          initialNavigation={initialNavigation}
          initialRoleConfig={initialRoleConfig}
          applets={applets}
        >
          {children}
        </AppletProvider>
      </FeatureFlagProvider>
    </QueryClientProvider>
  );
}