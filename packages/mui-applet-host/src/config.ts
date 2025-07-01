// =============================================================================
// SMBC MUI Host - Configuration Utilities
// =============================================================================

import { HostConfig } from "./types";

/**
 * Define a host configuration with type safety and validation
 */
export function defineConfig(config: HostConfig): HostConfig {
  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: HostConfig): string[] {
  const errors: string[] = [];

  if (!config.applets || config.applets.length === 0) {
    errors.push("At least one applet must be specified");
  }

  if (!config.roles || config.roles.length === 0) {
    errors.push("At least one role must be specified");
  }

  // Validate applet configurations
  config.applets.forEach((applet, index) => {
    if (typeof applet === "object" && !applet.name) {
      errors.push(`Applet at index ${index} must have a name`);
    }
  });

  return errors;
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): HostConfig {
  return {
    applets: [],
    roles: ["Guest", "User", "Admin"],
    app: {
      name: "SMBC Application",
      theme: "light",
    },
    features: {
      darkMode: true,
      mockData: false,
    },
  };
}
