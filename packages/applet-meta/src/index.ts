/**
 * SMBC applet metadata and registry
 * 
 * This module provides centralized access to applet information and
 * shared dependency versions across the monorepo.
 */

// Re-export everything from metadata.keep.js
// @ts-ignore
export { CORE_DEPS, SMBC_PACKAGES, APPLET_METADATA, getAppletsByFramework } from './metadata.keep.js';

// @ts-ignore
import { APPLET_METADATA } from './metadata.keep.js';

/**
 * Get package name for an applet ID (converts ID to package name)
 */
export function getAppletPackageName(appletId: string): string | undefined {
  // Convert applet ID to package name format
  return `@smbc/${appletId}-mui`;
}

/**
 * Check if an applet has installation documentation
 */
export function hasAppletInstallDocs(appletId: string): boolean {
  const packageName = getAppletPackageName(appletId);
  return packageName ? packageName in APPLET_METADATA : false;
}

/**
 * Check if an applet supports backend integration
 */
export function hasAppletBackend(appletId: string): boolean {
  // Backend support mapping based on applet type
  const backendApplets = ['user-management', 'admin-users', 'product-catalog'];
  return backendApplets.includes(appletId);
}

/**
 * Get all available applet IDs
 */
export function getAvailableAppletIds(): string[] {
  // Extract IDs from package names in APPLET_METADATA
  return Object.keys(APPLET_METADATA).map(pkg => 
    pkg.replace('@smbc/', '').replace('-mui', '')
  );
}

/**
 * Backward compatibility export
 */
export const APPLET_REGISTRY = Object.fromEntries(
  getAvailableAppletIds().map(id => [
    id,
    {
      packageName: getAppletPackageName(id)!,
      hasInstallDocs: hasAppletInstallDocs(id),
      hasBackend: hasAppletBackend(id),
    }
  ])
);

// Re-export documentation functions from applet-docs.keep.js
// @ts-ignore
export { getAppletDocs, hasBackendDocs } from './applet-docs.keep.js';

// Missing exports that InstallationModal needs
export const CORE_PEER_DEPS = {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@mui/material": "^5.0.0",
  "@mui/icons-material": "^5.0.0"
};