/**
 * Get version for a package from the host app's dependencies
 * Simple runtime lookup from package.json
 * Returns empty string for workspace/local packages (shows as unversioned)
 */
export function getPackageVersion(packageName: string): string {
  if (!packageName) return '';
  
  try {
    // Read the host app's package.json
    const packageJsonPath = process.cwd() + '/package.json';
    console.log(`[getPackageVersion] Reading from: ${packageJsonPath}`);
    const packageJson = require(packageJsonPath);
    
    // Look in dependencies first, then devDependencies
    const version = 
      packageJson.dependencies?.[packageName] || 
      packageJson.devDependencies?.[packageName];
    
    console.log(`[getPackageVersion] ${packageName} -> ${version}`);
      
    if (!version || version === '*') {
      return '';
    }
    
    // Clean up version string (remove ^ ~ etc)
    const cleanVersion = version.replace(/^[\^~]/, '');
    console.log(`[getPackageVersion] ${packageName} cleaned -> ${cleanVersion}`);
    return cleanVersion;
  } catch (error) {
    console.error(`[getPackageVersion] Error for ${packageName}:`, error);
    return '';
  }
}