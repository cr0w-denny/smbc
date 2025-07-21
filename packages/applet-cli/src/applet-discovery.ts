import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
 */
export function getAvailableApplets(): DiscoveredApplet[] {
  try {
    // Check which registry @smbc scope is using
    const scopeConfig = execSync('npm config get @smbc:registry', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    
    const isLocalRegistry = scopeConfig.includes('localhost:4873');
    const registryUrl = isLocalRegistry 
      ? 'http://localhost:4873/-/verdaccio/data/search/smbc-applet'
      : 'https://registry.npmjs.org/-/v1/search?text=keywords:smbc-applet%20scope:smbc';
    
    // Make HTTP request to registry search API
    const searchResult = execSync(`curl -s "${registryUrl}"`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    
    const searchData = JSON.parse(searchResult);
    const packages = isLocalRegistry ? searchData : searchData.objects?.map((obj: any) => obj.package) || [];
    
    const applets: DiscoveredApplet[] = [];
    
    for (const pkg of packages) {
      // Only process @smbc packages
      if (!pkg.name?.startsWith('@smbc/')) {
        continue;
      }
      
      try {
        // Get detailed package info 
        const viewResult = execSync(`npm view ${pkg.name} --json`, {
          cwd: process.cwd(),
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore']
        });
        
        const packageInfo = JSON.parse(viewResult);
        
        // Check if it has applet metadata
        if (packageInfo.smbc?.applet) {
          const metadata = packageInfo.smbc.applet;
          applets.push({
            packageName: pkg.name,
            version: packageInfo.version,
            metadata: {
              id: metadata.id,
              name: metadata.name,
              description: metadata.description || pkg.description,
              framework: metadata.framework || 'mui',
              icon: metadata.icon,
              path: metadata.path,
              permissions: metadata.permissions || [],
              exportName: metadata.exportName
            }
          });
        }
      } catch (error) {
        // Skip packages that can't be viewed
        console.warn(`Could not get info for ${pkg.name}:`, (error as Error).message);
      }
    }
    
    return applets;
  } catch (error) {
    console.warn('Could not search npm registry for applets:', (error as Error).message);
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