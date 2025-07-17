/**
 * SMBC applet metadata and registry
 *
 * This module provides centralized access to applet information and
 * shared dependency versions across the monorepo.
 */
export { CORE_DEPS, SMBC_PACKAGES, APPLET_METADATA, getAppletsByFramework } from './metadata.js';
/**
 * Get package name for an applet ID (converts ID to package name)
 */
export declare function getAppletPackageName(appletId: string): string | undefined;
/**
 * Check if an applet has installation documentation
 */
export declare function hasAppletInstallDocs(appletId: string): boolean;
/**
 * Check if an applet supports backend integration
 */
export declare function hasAppletBackend(appletId: string): boolean;
/**
 * Get all available applet IDs
 */
export declare function getAvailableAppletIds(): string[];
/**
 * Backward compatibility export
 */
export declare const APPLET_REGISTRY: {
    [k: string]: {
        packageName: string;
        hasInstallDocs: boolean;
        hasBackend: boolean;
    };
};
//# sourceMappingURL=index.d.ts.map