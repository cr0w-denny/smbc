#!/usr/bin/env tsx

/**
 * Peer dependency management tool for SMBC monorepo
 * 
 * Automatically moves externalized dependencies to peerDependencies in applet packages.
 * This ensures that externalized dependencies are not bundled with the applet.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import chalk from "chalk";
import { EXTERNALS_PRESETS, SMBC_CORE_EXTERNALS } from "../../packages/vite-config/src/externals/index.js";
import { SMBC_PACKAGES } from "../../packages/applet-meta/index.mjs";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

/**
 * Find all applet package.json files
 */
async function findAppletPackageJsonFiles(): Promise<string[]> {
  const pattern = "applets/*/*/package.json";
  const matches = await glob(pattern, { cwd: rootDir });
  return matches.map((f) => join(rootDir, f));
}

/**
 * Find vite config file for an applet
 */
function findViteConfigFile(appletDir: string): string | null {
  const configFiles = [
    "vite.config.ts",
    "vite.config.js", 
    "vite.config.mjs"
  ];
  
  for (const configFile of configFiles) {
    const configPath = join(appletDir, configFile);
    try {
      if (readFileSync(configPath, "utf-8")) {
        return configPath;
      }
    } catch {
      // File doesn't exist, continue
    }
  }
  
  return null;
}

/**
 * Extract externalized dependencies from vite config
 */
function getExternalizedDeps(viteConfigPath: string): string[] {
  try {
    const configContent = readFileSync(viteConfigPath, "utf-8");
    
    // Look for externalsPreset usage - this indicates using standard externals
    const hasExternalsPreset = configContent.includes("externalsPreset") || 
                              configContent.includes("createAppletConfig");
    
    if (hasExternalsPreset) {
      // Use the actual 'full' preset from vite-config
      // This excludes SMBC packages since they should remain as dependencies
      const fullExternals = EXTERNALS_PRESETS.full;
      return fullExternals.filter(dep => !SMBC_CORE_EXTERNALS.includes(dep));
    }
    
    return [];
  } catch (error) {
    console.warn(chalk.yellow(`Could not read vite config ${viteConfigPath}: ${error instanceof Error ? error.message : String(error)}`));
    return [];
  }
}

/**
 * Read and parse a package.json file
 */
function readPackageJson(filePath: string): PackageJson | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error reading ${filePath}: ${error instanceof Error ? error.message : String(error)}`));
    return null;
  }
}

/**
 * Write a package.json file with proper formatting
 */
function writePackageJson(filePath: string, data: PackageJson): boolean {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    return true;
  } catch (error) {
    console.error(chalk.red(`Error writing ${filePath}: ${error instanceof Error ? error.message : String(error)}`));
    return false;
  }
}

/**
 * Get package info from file path
 */
function getPackageInfo(filePath: string) {
  const relativePath = filePath.replace(rootDir + "/", "");
  const parts = relativePath.split("/");
  
  if (parts[0] === "applets") {
    return { type: "applet", name: `${parts[1]}/${parts[2]}` };
  }
  
  return { type: "unknown", name: relativePath };
}

/**
 * Move externalized dependencies to peerDependencies
 */
async function moveToPeerDependencies() {
  console.log(chalk.blue("🔄 Moving externalized dependencies to peerDependencies...\n"));
  
  const files = await findAppletPackageJsonFiles();
  let updatedCount = 0;
  
  for (const filePath of files) {
    const pkg = readPackageJson(filePath);
    if (!pkg) continue;
    
    const info = getPackageInfo(filePath);
    const appletDir = dirname(filePath);
    const viteConfigPath = findViteConfigFile(appletDir);
    
    if (!viteConfigPath) {
      console.log(chalk.gray(`  ${info.name}: No vite config found, skipping`));
      continue;
    }
    
    const externalizedDeps = getExternalizedDeps(viteConfigPath);
    if (externalizedDeps.length === 0) {
      console.log(chalk.gray(`  ${info.name}: No externalized dependencies found`));
      continue;
    }
    
    let hasChanges = false;
    
    // Initialize peerDependencies if it doesn't exist
    if (!pkg.peerDependencies) {
      pkg.peerDependencies = {};
    }
    
    // Check dependencies that should be moved to peerDependencies
    if (pkg.dependencies) {
      for (const depName of Object.keys(pkg.dependencies)) {
        // Skip SMBC packages - they should remain as regular dependencies
        if (SMBC_PACKAGES.includes(depName)) {
          continue;
        }
        
        // If this dependency is externalized, move it to peerDependencies
        if (externalizedDeps.includes(depName)) {
          const version = pkg.dependencies[depName];
          
          // Move to peerDependencies
          pkg.peerDependencies[depName] = version;
          delete pkg.dependencies[depName];
          
          console.log(chalk.yellow(`  ${info.name}: Moved ${depName}@${version} to peerDependencies`));
          hasChanges = true;
        }
      }
      
      // Clean up empty dependencies object
      if (Object.keys(pkg.dependencies).length === 0) {
        delete pkg.dependencies;
      }
    }
    
    if (hasChanges) {
      if (writePackageJson(filePath, pkg)) {
        updatedCount++;
      }
    }
  }
  
  console.log(chalk.green(`\n✅ Updated ${updatedCount} applet package.json files`));
}

/**
 * Main CLI
 */
async function main() {
  await moveToPeerDependencies();
}

main().catch((error) => {
  console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
});