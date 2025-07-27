import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SMBC_PACKAGE_VERSIONS, SMBC_PACKAGES } from '@smbc/applet-meta';

export interface AppletMetadata {
  id: string;
  name: string;
  description: string;
  framework: string;
  icon: string;
  path: string;
  permissions: string[];
  exportName: string;
}

export interface DiscoveredApplet {
  packageName: string;
  version: string;
  metadata: AppletMetadata;
}

/**
 * Discover installed SMBC applet packages using npm ls
 */
export function getInstalledApplets(): DiscoveredApplet[] {
  try {
    const result = execSync('npm ls --json --depth=0', { 
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'] // Ignore stderr to suppress warnings
    });
    
    const npmData = JSON.parse(result);
    const dependencies = npmData.dependencies || {};
    
    // Filter for @smbc packages that have applet metadata
    const applets: DiscoveredApplet[] = [];
    
    for (const [packageName, packageInfo] of Object.entries(dependencies)) {
      if (packageName.startsWith('@smbc/') && packageName.includes('-mui')) {
        try {
          // Try to read the package.json for this installed package
          const packageJsonPath = resolve(process.cwd(), 'node_modules', packageName, 'package.json');
          if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            
            // Check if it has applet metadata
            if (packageJson.smbc?.applet) {
              applets.push({
                packageName,
                version: (packageInfo as any).version,
                metadata: packageJson.smbc.applet
              });
            }
          }
        } catch (error) {
          // Skip packages that can't be read
          console.warn(`Could not read metadata for ${packageName}:`, error);
        }
      }
    }
    
    return applets;
  } catch (error) {
    console.warn('Could not discover packages via npm ls:', (error as Error).message);
    return [];
  }
}

/**
 * Search npm registry for available SMBC applets using keywords
 * Now uses local version data from applet-meta to avoid network calls
 */
export function getAvailableApplets(): DiscoveredApplet[] {
  try {
    const applets: DiscoveredApplet[] = [];
    
    // Filter SMBC_PACKAGES for applet packages (those ending with -mui)
    const appletPackages = SMBC_PACKAGES.filter(pkg => 
      pkg.includes('-mui') && !pkg.includes('storybook')
    );
    
    for (const packageName of appletPackages) {
      try {
        // First check if the package is installed locally
        const packageJsonPath = resolve(process.cwd(), 'node_modules', packageName, 'package.json');
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          
          // Check if it has applet metadata
          if (packageJson.smbc?.applet) {
            const metadata = packageJson.smbc.applet;
            applets.push({
              packageName,
              version: SMBC_PACKAGE_VERSIONS[packageName] || packageJson.version,
              metadata: {
                id: metadata.id,
                name: metadata.name,
                description: metadata.description || packageJson.description,
                framework: metadata.framework || 'mui',
                icon: metadata.icon,
                path: metadata.path,
                permissions: metadata.permissions || [],
                exportName: metadata.exportName
              }
            });
          }
        } else {
          // Package not installed locally - we know it exists from SMBC_PACKAGES
          // but we can't access its metadata without installation
          // Extract ID from package name (e.g., @smbc/hello-mui -> hello)
          const match = packageName.match(/@smbc\/(.+)-mui$/);
          if (match) {
            const id = match[1];
            applets.push({
              packageName,
              version: SMBC_PACKAGE_VERSIONS[packageName] || 'latest',
              metadata: {
                id,
                name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
                description: `${id} applet (install to see full details)`,
                framework: 'mui',
                icon: '',
                path: `/${id}`,
                permissions: [],
                exportName: 'default'
              }
            });
          }
        }
      } catch (error) {
        // Skip packages that can't be read
        console.warn(`Could not read metadata for ${packageName}:`, (error as Error).message);
      }
    }
    
    return applets;
  } catch (error) {
    console.warn('Could not get available applets:', (error as Error).message);
    return [];
  }
}

/**
 * Get applets filtered by framework
 */
export function getAppletsByFramework(framework = 'mui'): DiscoveredApplet[] {
  // First try to get available applets from registry
  const availableApplets = getAvailableApplets();
  if (availableApplets.length > 0) {
    return availableApplets.filter(applet => applet.metadata.framework === framework);
  }
  
  // Fallback to installed applets
  const installedApplets = getInstalledApplets();
  return installedApplets.filter(applet => applet.metadata.framework === framework);
}

/**
 * Get package name for an applet ID (converts ID to package name)
 */
export function getAppletPackageName(appletId: string): string {
  return `@smbc/${appletId}-mui`;
}

/**
 * Check if an applet package is installed
 */
export function isAppletInstalled(appletId: string): boolean {
  const packageName = getAppletPackageName(appletId);
  const applets = getInstalledApplets();
  return applets.some(applet => applet.packageName === packageName);
}

/**
 * Get all available applet IDs from installed packages
 */
export function getInstalledAppletIds(): string[] {
  const applets = getInstalledApplets();
  return applets.map(applet => applet.metadata.id);
}

/**
 * Create a registry-like object for backward compatibility
 */
export function createAppletRegistry(): Record<string, DiscoveredApplet> {
  const applets = getInstalledApplets();
  const registry: Record<string, DiscoveredApplet> = {};
  
  for (const applet of applets) {
    registry[applet.metadata.id] = applet;
  }
  
  return registry;
}