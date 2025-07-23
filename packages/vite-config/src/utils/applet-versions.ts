import fs from "fs";
import path from "path";

/**
 * Helper function to find the version of a workspace package
 */
function getWorkspacePackageVersion(packageName: string, hostPackageJsonPath: string): string | null {
  const hostDir = path.dirname(hostPackageJsonPath);
  
  // Look for applet workspace packages
  const packageNameWithoutScope = packageName.replace('@smbc/', '');
  const possiblePaths = [
    // applets/package-name/mui/package.json (for MUI applets)  
    path.join(hostDir, 'applets', packageNameWithoutScope.replace('-mui', ''), 'mui', 'package.json'),
    // applets/package-name/api/package.json (for API packages)
    path.join(hostDir, 'applets', packageNameWithoutScope.replace('-api', ''), 'api', 'package.json'),
  ];
  
  for (const possiblePath of possiblePaths) {
    try {
      if (fs.existsSync(possiblePath)) {
        const packageJson = JSON.parse(fs.readFileSync(possiblePath, 'utf-8'));
        if (packageJson.name === packageName && packageJson.version) {
          return packageJson.version;
        }
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  return null;
}

/**
 * Reads package.json and extracts versions for @smbc packages
 * Returns an object that can be injected as a global constant
 */
export function getAppletVersions(packageJsonPath?: string): Record<string, string> {
  const resolvedPath = packageJsonPath || path.resolve(process.cwd(), "package.json");
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
    const appletVersions: Record<string, string> = {};
    
    // Extract versions for all @smbc packages
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const [pkg, version] of Object.entries(allDeps)) {
      if (pkg.startsWith("@smbc/") && typeof version === "string") {
        if (version === "*") {
          // For workspace packages with "*", try to read their actual version
          const workspaceVersion = getWorkspacePackageVersion(pkg, resolvedPath);
          if (workspaceVersion) {
            appletVersions[pkg] = workspaceVersion;
          }
        } else {
          appletVersions[pkg] = version.replace(/^[\^~]/, "");
        }
      }
    }
    
    return appletVersions;
  } catch (error) {
    console.warn("Failed to read applet versions from package.json:", error);
    return {};
  }
}

/**
 * Vite plugin to inject applet versions as global constants
 * Usage in vite.config.ts:
 * 
 * import { injectAppletVersions } from "@smbc/vite-config/utils/applet-versions";
 * 
 * export default defineConfig({
 *   define: {
 *     ...injectAppletVersions(),
 *   }
 * });
 */
export function injectAppletVersions(packageJsonPath?: string): Record<string, string> {
  const versions = getAppletVersions(packageJsonPath);
  
  // Convert to define format with proper JSON stringification
  const defines: Record<string, string> = {};
  defines['__APPLET_VERSIONS__'] = JSON.stringify(versions);
  
  return defines;
}