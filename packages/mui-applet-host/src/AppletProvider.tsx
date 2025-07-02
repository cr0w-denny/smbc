// =============================================================================
// SMBC MUI Host - Applet Provider (for existing apps)
// =============================================================================

import { useMemo, ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import {
  AppProvider,
  FeatureFlagProvider,
  useFeatureFlag,
} from "@smbc/applet-core";
import { AppletQueryProvider } from "@smbc/applet-query-client";
import { lightTheme, darkTheme } from "@smbc/mui-components";
import { AppletProviderProps } from "./types";

/**
 * AppletProvider - Lightweight provider for existing React apps
 *
 * This component provides the applet system functionality without imposing
 * any UI structure. It's designed for existing apps that want to integrate
 * SMBC applets while maintaining their own layout and navigation.
 */
export function AppletProvider({
  children,
  applets: _appletConfigs,
  roles,
  user,
  permissions = {},
  features = {},
  theme = "light",
}: AppletProviderProps) {
  // Build role configuration
  const roleConfig = useMemo(() => {
    return {
      roles,
      permissionMappings: permissions,
    };
  }, [roles, permissions]);

  // Feature flag configuration
  const featureFlagConfigs = useMemo(
    () => [
      {
        key: "darkMode",
        defaultValue: theme === "dark",
        description: "Enable dark mode theme",
        persist: true,
      },
      {
        key: "mockData",
        defaultValue: features.mockData || false,
        description: "Use mock data instead of real API endpoints",
        persist: true,
      },
      ...Object.entries(features).map(([key, value]) => ({
        key,
        defaultValue: value,
        description: `Feature: ${key}`,
        persist: true,
      })),
    ],
    [theme, features],
  );

  return (
    <FeatureFlagProvider configs={featureFlagConfigs} storagePrefix="smbcHost">
      <AppletProviderWithTheme roleConfig={roleConfig} user={user}>
        {children}
      </AppletProviderWithTheme>
    </FeatureFlagProvider>
  );
}

interface AppletProviderWithThemeProps {
  children: ReactNode;
  roleConfig: any;
  user?: any;
}

function AppletProviderWithTheme({
  children,
  roleConfig,
  user,
}: AppletProviderWithThemeProps) {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const mockEnabled = useFeatureFlag<boolean>("mockData") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppProvider initialRoleConfig={roleConfig} initialUser={user}>
        <AppletQueryProvider enableMocks={mockEnabled}>
          {children}
        </AppletQueryProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
