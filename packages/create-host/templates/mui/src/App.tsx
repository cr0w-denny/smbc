import {
  AppProvider,
  calculatePermissionsFromRoles,
  FeatureFlagProvider,
} from "@smbc/applet-core";
import { QueryClientProvider } from "@tanstack/react-query";

import { demoUser, roleConfig } from "./app.config";
import { AppWithTheme } from "./components";
import { featureFlags } from "./feature-flags";
import { queryClient } from "./query-client";

export function App() {
  const userWithPermissions = {
    ...demoUser,
    permissions: calculatePermissionsFromRoles(demoUser.roles, roleConfig),
  };
  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider configs={featureFlags} storagePrefix="smbcHost">
        <AppProvider
          initialRoleConfig={roleConfig}
          initialUser={userWithPermissions}
        >
          <AppWithTheme />
        </AppProvider>
      </FeatureFlagProvider>
    </QueryClientProvider>
  );
}
