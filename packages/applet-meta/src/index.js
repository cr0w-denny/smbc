/**
 * SMBC applet metadata and registry
 *
 * This module provides centralized access to applet information and
 * shared dependency versions across the monorepo.
 */
// Re-export everything from metadata.js
export { CORE_DEPS, SMBC_PACKAGES, APPLET_METADATA, getAppletsByFramework } from './metadata.js';
import { APPLET_METADATA } from './metadata.js';
/**
 * Get package name for an applet ID (converts ID to package name)
 */
export function getAppletPackageName(appletId) {
    // Convert applet ID to package name format
    return `@smbc/${appletId}-mui`;
}
/**
 * Check if an applet has installation documentation
 */
export function hasAppletInstallDocs(appletId) {
    const packageName = getAppletPackageName(appletId);
    return packageName ? packageName in APPLET_METADATA : false;
}
/**
 * Check if an applet supports backend integration
 */
export function hasAppletBackend(appletId) {
    // Backend support mapping based on applet type
    const backendApplets = ['user-management', 'admin-users', 'product-catalog'];
    return backendApplets.includes(appletId);
}
/**
 * Get all available applet IDs
 */
export function getAvailableAppletIds() {
    // Extract IDs from package names in APPLET_METADATA
    return Object.keys(APPLET_METADATA).map(pkg => pkg.replace('@smbc/', '').replace('-mui', ''));
}
/**
 * Backward compatibility export
 */
export const APPLET_REGISTRY = Object.fromEntries(getAvailableAppletIds().map(id => [
    id,
    {
        packageName: getAppletPackageName(id),
        hasInstallDocs: hasAppletInstallDocs(id),
        hasBackend: hasAppletBackend(id),
    }
]));
