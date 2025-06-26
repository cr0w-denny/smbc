// =============================================================================
// SMBC MUI Host - Utility Functions
// =============================================================================

import { AppletConfig } from "./types";

/**
 * Normalize applet configuration
 */
export function normalizeAppletConfig(
  config: string | AppletConfig,
): AppletConfig {
  if (typeof config === "string") {
    return {
      name: config,
    };
  }
  return config;
}

/**
 * Generate applet ID from package name
 */
export function generateAppletId(packageName: string): string {
  return packageName
    .replace("@smbc/", "")
    .replace("-mui", "")
    .replace(/[-_]/g, "-")
    .toLowerCase();
}

/**
 * Check if package is an SMBC applet
 */
export function isSmBcApplet(packageName: string): boolean {
  return packageName.startsWith("@smbc/") && packageName.includes("-mui");
}

/**
 * Extract package name from applet configuration
 */
export function getPackageName(config: string | AppletConfig): string {
  return typeof config === "string" ? config : config.name;
}
