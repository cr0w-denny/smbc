import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getTheme } from "@smbc/ui-core";
import { AppletHost } from "@smbc/mui-applet-core";

import { 
  demoUser, 
  appletDefinitions, 
  calculatePermissionsFromRoles, 
  roleConfig,
  APP_CONSTANTS 
} from "./app.config";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
    },
  },
});

export default function App() {
  const theme = getTheme(demoUser.preferences.theme);
  const userPermissions = calculatePermissionsFromRoles(demoUser.roles, roleConfig);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AppletHost
          user={demoUser}
          permissions={userPermissions}
          applets={appletDefinitions}
          config={{
            appName: APP_CONSTANTS.appName,
            showDevtools: true,
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}