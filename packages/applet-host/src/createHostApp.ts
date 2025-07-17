/**
 * Convenience utilities for creating and configuring host applications
 */

import { 
  createPermissionRequirements,
  generatePermissionMappings,
  RoleConfig,
  AppletMount
} from '@smbc/applet-core';
import { HostConfig, FeatureFlagConfig } from './types';

/**
 * Create a complete host configuration with sensible defaults
 */
export function createHostConfig(config: {
  appName: string;
  appletConfigs: Record<string, { applet: any; permissions: Record<string, string> }>;
  roles: readonly string[];
  demoUser?: HostConfig['demoUser'];
}): HostConfig {
  const permissionRequirements = createPermissionRequirements(
    config.appletConfigs
  );

  const roleConfig: RoleConfig = {
    roles: [...config.roles],
    permissionMappings: generatePermissionMappings(
      config.roles,
      permissionRequirements
    ),
  };

  // Convert applet configs to applet mounts (simplified for this utility)
  const appletMounts: Record<string, AppletMount> = {};
  for (const [id, appletConfig] of Object.entries(config.appletConfigs)) {
    appletMounts[id] = {
      id,
      label: appletConfig.applet.name || id,
      routes: [], // Would need to be populated based on applet structure
    };
  }

  return {
    appName: config.appName,
    appletMounts,
    roles: config.roles,
    roleConfig,
    demoUser: config.demoUser || {
      id: "1",
      email: "user@example.com",
      name: "Demo User",
      roles: [config.roles[0] as string], // First role as default
      preferences: {
        theme: "light",
        language: "en",
        timezone: "UTC",
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
      },
    },
  };
}

/**
 * Common feature flags for host applications
 */
export const defaultFeatureFlags: FeatureFlagConfig[] = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "mockData",
    defaultValue: true,
    description: "Use mock data instead of real API endpoints",
    persist: true,
  },
  {
    key: "devtools",
    defaultValue: true,
    description: "Show development tools and debugging info",
    persist: true,
  },
];

/**
 * Create feature flags with custom overrides
 */
export function createFeatureFlags(
  customFlags: Partial<FeatureFlagConfig>[] = []
): FeatureFlagConfig[] {
  const flagMap = new Map<string, FeatureFlagConfig>();
  
  // Add default flags
  defaultFeatureFlags.forEach(flag => {
    flagMap.set(flag.key, flag);
  });
  
  // Override with custom flags
  customFlags.forEach(customFlag => {
    if (customFlag.key) {
      const existing = flagMap.get(customFlag.key);
      flagMap.set(customFlag.key, {
        ...existing,
        ...customFlag,
      } as FeatureFlagConfig);
    }
  });
  
  return Array.from(flagMap.values());
}