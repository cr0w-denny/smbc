import type { AppletMount } from "@smbc/applet-core";
import { _setAppletRegistry } from "@smbc/applet-core";

// Host-level registry of applet configurations
let hostAppletRegistry = new Map<string, AppletMount>();

/**
 * Configure applets with their API base URLs (called by host application)
 */
export function configureApplets(applets: AppletMount[]): void {
  hostAppletRegistry.clear();
  applets.forEach(applet => {
    hostAppletRegistry.set(applet.id, applet);
  });
  
  // Also configure the applet-core registry for API client usage
  _setAppletRegistry(applets);
}

/**
 * Get applet configuration from registry
 */
export function getAppletConfig(appletId: string): AppletMount | undefined {
  return hostAppletRegistry.get(appletId);
}

/**
 * Get all configured applets
 */
export function getAllApplets(): AppletMount[] {
  return Array.from(hostAppletRegistry.values());
}