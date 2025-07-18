/**
 * SMBC applet metadata and registry
 * 
 * This module provides centralized access to applet information and
 * shared dependency versions across the monorepo.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Re-export core dependencies and packages list from static metadata
// @ts-ignore
export { CORE_DEPS, SMBC_PACKAGES } from './metadata.keep.js';

/**
 * Discover installed SMBC applet packages using npm ls
 */
function getInstalledSmbcPackages(): Record<string, any> {
  try {
    const result = execSync('npm ls --json --depth=0', { 
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'] // Ignore stderr to suppress warnings
    });
    const npmData = JSON.parse(result);
    const dependencies = npmData.dependencies || {};
    
    // Filter for @smbc packages that have applet metadata
    const smbcApplets: Record<string, any> = {};
    
    for (const [packageName, packageInfo] of Object.entries(dependencies)) {
      if (packageName.startsWith('@smbc/') && packageName.includes('-mui')) {
        try {
          // Try to read the package.json for this installed package
          const packageJsonPath = resolve(process.cwd(), 'node_modules', packageName, 'package.json');
          if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            if (packageJson.smbc?.applet) {
              smbcApplets[packageName] = {
                version: (packageInfo as any).version,
                ...packageJson.smbc.applet
              };
            }
          }
        } catch (error) {
          // Skip packages that can't be read
          console.warn(`Could not read metadata for ${packageName}:`, error);
        }
      }
    }
    
    return smbcApplets;
  } catch (error) {
    console.warn('Could not discover packages via npm ls:', (error as Error).message);
    return {};
  }
}

/**
 * Get applet metadata - dynamically discovered from installed packages
 */
export function getAppletMetadata(): Record<string, any> {
  return getInstalledSmbcPackages();
}

/**
 * Backward compatibility: static export (but now dynamic)
 */
export const APPLET_METADATA = getAppletMetadata();

/**
 * Get applets filtered by framework
 */
export function getAppletsByFramework(framework = 'mui'): Record<string, any> {
  const metadata = getAppletMetadata();
  const result: Record<string, any> = {};
  
  for (const [packageName, appletData] of Object.entries(metadata)) {
    if (appletData.framework === framework) {
      result[packageName] = {
        packageName,
        ...appletData
      };
    }
  }
  
  return result;
}

/**
 * Get package name for an applet ID (converts ID to package name)
 */
export function getAppletPackageName(appletId: string): string | undefined {
  return `@smbc/${appletId}-mui`;
}

/**
 * Check if an applet has installation documentation
 */
export function hasAppletInstallDocs(appletId: string): boolean {
  const packageName = getAppletPackageName(appletId);
  const metadata = getAppletMetadata();
  return packageName ? packageName in metadata : false;
}

/**
 * Check if an applet supports backend integration
 */
export function hasAppletBackend(appletId: string): boolean {
  const backendApplets = ['user-management', 'admin-users', 'product-catalog'];
  return backendApplets.includes(appletId);
}

/**
 * Get all available applet IDs
 */
export function getAvailableAppletIds(): string[] {
  const metadata = getAppletMetadata();
  return Object.keys(metadata).map(pkg => 
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