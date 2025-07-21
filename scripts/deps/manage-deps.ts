#!/usr/bin/env tsx

/**
 * Dependency management tool for SMBC monorepo
 *
 * Commands:
 * - sync: Synchronize dependency versions across all packages
 * - update <package@version>: Update a specific dependency across all packages
 * - validate: Check for version conflicts and mismatches
 * - list: Show all dependencies and their versions across packages
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import chalk from "chalk";
import { table } from "table";
import { CORE_DEPS, SMBC_PACKAGES } from "@smbc/applet-meta";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: any;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

/**
 * Find all package.json files in the monorepo
 */
async function findPackageJsonFiles(): Promise<string[]> {
  const patterns = [
    "package.json",
    "packages/*/package.json",
    "apps/*/package.json",
    "applets/*/*/package.json",
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: rootDir });
    files.push(...matches.map((f) => join(rootDir, f)));
  }

  return files;
}

/**
 * Read and parse a package.json file
 */
function readPackageJson(filePath: string): PackageJson | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error reading ${filePath}: ${error instanceof Error ? error.message : error}`));
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
    console.error(chalk.red(`Error writing ${filePath}: ${error instanceof Error ? error.message : error}`));
    return false;
  }
}

/**
 * Get package info from file path
 */
function getPackageInfo(filePath: string): { type: string; name: string } {
  const relativePath = filePath.replace(rootDir + "/", "");
  const parts = relativePath.split("/");

  if (relativePath === "package.json") {
    return { type: "root", name: "monorepo root" };
  } else if (parts[0] === "packages") {
    return { type: "package", name: parts[1] };
  } else if (parts[0] === "apps") {
    return { type: "app", name: parts[1] };
  } else if (parts[0] === "applets") {
    return { type: "applet", name: `${parts[1]}/${parts[2]}` };
  }

  return { type: "unknown", name: relativePath };
}

/**
 * Sync command - synchronize dependency versions
 */
async function syncDependencies() {
  console.log(chalk.blue("🔄 Synchronizing dependency versions...\n"));

  const files = await findPackageJsonFiles();
  let updatedCount = 0;

  for (const filePath of files) {
    const pkg = readPackageJson(filePath);
    if (!pkg) continue;

    const info = getPackageInfo(filePath);
    let hasChanges = false;

    // Update dependencies
    for (const depType of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      if (!pkg[depType]) continue;

      for (const [depName, currentVersion] of Object.entries(pkg[depType] as Record<string, string>)) {
        // Handle core dependencies
        if (CORE_DEPS[depName]) {
          const targetVersion = CORE_DEPS[depName];
          if (currentVersion !== targetVersion) {
            console.log(
              chalk.yellow(
                `  ${info.name}: ${depName} ${currentVersion} → ${targetVersion}`,
              ),
            );
            pkg[depType][depName] = targetVersion;
            hasChanges = true;
          }
        }

        // For SMBC packages, npm workspaces will handle resolution automatically
        // We just log if we see version mismatches for awareness
        if (SMBC_PACKAGES.includes(depName) && info.type !== "root") {
          // If it has a specific version (not * or ^0.0.1), it might need attention
          if (
            currentVersion !== "^0.0.1" &&
            currentVersion !== "*" &&
            !currentVersion.startsWith("file:")
          ) {
            console.log(
              chalk.blue(
                `  ${info.name}: ${depName} has version ${currentVersion} (npm workspace will resolve)`,
              ),
            );
          }
        }
      }
    }

    if (hasChanges) {
      if (writePackageJson(filePath, pkg)) {
        updatedCount++;
      }
    }
  }

  console.log(chalk.green(`\n✅ Updated ${updatedCount} package.json files`));
  
}

/**
 * Update command - update a specific dependency
 */
async function updateDependency(packageSpec: string): Promise<void> {
  const match = packageSpec.match(/^(@?[^@]+)@(.+)$/);
  if (!match) {
    console.error(
      chalk.red("Invalid package specification. Use format: package@version"),
    );
    process.exit(1);
  }

  const [, packageName, version] = match;
  console.log(chalk.blue(`📦 Updating ${packageName} to ${version}...\n`));

  const files = await findPackageJsonFiles();
  let updatedCount = 0;

  for (const filePath of files) {
    const pkg = readPackageJson(filePath);
    if (!pkg) continue;

    const info = getPackageInfo(filePath);
    let hasChanges = false;

    for (const depType of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      if (!pkg[depType]) continue;

      if (pkg[depType][packageName]) {
        const currentVersion = pkg[depType][packageName];
        if (currentVersion !== version) {
          console.log(
            chalk.yellow(
              `  ${info.name}: ${depType} - ${currentVersion} → ${version}`,
            ),
          );
          pkg[depType][packageName] = version;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      if (writePackageJson(filePath, pkg)) {
        updatedCount++;
      }
    }
  }

  console.log(chalk.green(`\n✅ Updated ${updatedCount} package.json files`));
}

/**
 * Validate command - check for version conflicts
 */
async function validateDependencies() {
  console.log(chalk.blue("🔍 Validating dependency versions...\n"));

  const files = await findPackageJsonFiles();
  const depVersions = new Map(); // dep -> Map(version -> locations[])
  let hasConflicts = false;

  // Collect all dependency versions
  for (const filePath of files) {
    const pkg = readPackageJson(filePath);
    if (!pkg) continue;

    const info = getPackageInfo(filePath);

    for (const depType of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      if (!pkg[depType]) continue;

      for (const [depName, version] of Object.entries(pkg[depType] as Record<string, string>)) {
        if (!depVersions.has(depName)) {
          depVersions.set(depName, new Map());
        }

        const versionMap = depVersions.get(depName);
        if (!versionMap.has(version)) {
          versionMap.set(version, []);
        }

        versionMap.get(version).push({
          location: info.name,
          type: info.type,
          depType,
        });
      }
    }
  }

  // Check for conflicts
  for (const [depName, versionMap] of depVersions) {
    if (versionMap.size > 1) {
      // Skip SMBC packages - npm workspaces handles these
      if (SMBC_PACKAGES.includes(depName)) {
        continue;
      }

      hasConflicts = true;
      console.log(chalk.red(`\n❌ Conflict found for ${depName}:`));

      for (const [version, locations] of versionMap) {
        console.log(chalk.yellow(`  ${version}:`));
        for (const loc of locations) {
          console.log(`    - ${loc.location} (${loc.depType})`);
        }
      }
    }
  }

  if (!hasConflicts) {
    console.log(chalk.green("✅ No version conflicts found!"));
  } else {
    console.log(
      chalk.red('\n❌ Version conflicts detected. Run "sync" to fix.'),
    );
    process.exit(1);
  }
}

/**
 * List command - show all dependencies
 */
async function listDependencies() {
  console.log(chalk.blue("📋 Listing all dependencies...\n"));

  const files = await findPackageJsonFiles();
  const depVersions = new Map(); // dep -> Set(versions)

  // Collect all unique dependencies
  for (const filePath of files) {
    const pkg = readPackageJson(filePath);
    if (!pkg) continue;

    for (const depType of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      if (!pkg[depType]) continue;

      for (const [depName, version] of Object.entries(pkg[depType] as Record<string, string>)) {
        if (!depVersions.has(depName)) {
          depVersions.set(depName, new Set<string>());
        }
        depVersions.get(depName)!.add(version);
      }
    }
  }

  // Prepare table data
  const tableData = [["Package", "Versions", "Status"]];

  const sortedDeps = Array.from(depVersions.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [depName, versions] of sortedDeps) {
    const versionArray = Array.from(versions) as string[];
    const nonWorkspaceVersions = versionArray.filter(
      (v) => !v.startsWith("file:") && v !== "*",
    );

    let status = chalk.green("OK");
    let versionDisplay = versionArray.join(", ");

    // Check if this is a core dependency
    if (CORE_DEPS[depName]) {
      const coreVersion = CORE_DEPS[depName];
      const hasCorrectVersion = versionArray.includes(coreVersion);
      
      if (!hasCorrectVersion) {
        status = chalk.red("MISMATCH");
        versionDisplay = chalk.yellow(versionDisplay) + chalk.gray(` (should be ${coreVersion})`);
      }
    } else if (nonWorkspaceVersions.length > 1) {
      status = chalk.yellow("WARN");
      versionDisplay = chalk.yellow(versionDisplay);
    }

    tableData.push([depName, versionDisplay, status]);
  }

  console.log(
    table(tableData, {
      columns: {
        0: { width: 40 },
        1: { width: 50 },
        2: { width: 10, alignment: "center" },
      },
    }),
  );
}

/**
 * Main CLI
 */
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case "sync":
      await syncDependencies();
      break;

    case "update":
      if (args.length === 0) {
        console.error(
          chalk.red("Please specify a package: update <package@version>"),
        );
        process.exit(1);
      }
      await updateDependency(args[0]);
      break;

    case "validate":
      await validateDependencies();
      break;

    case "list":
      await listDependencies();
      break;

    default:
      console.log(chalk.blue("SMBC Dependency Manager\n"));
      console.log("Commands:");
      console.log(
        "  sync                    - Synchronize dependency versions",
      );
      console.log("  update <package@version> - Update a specific dependency");
      console.log("  validate                - Check for version conflicts");
      console.log("  list                    - Show all dependencies");
      console.log("\nExample:");
      console.log("  node scripts/manage-deps sync");
      console.log("  node scripts/manage-deps update react@18.3.0");
      break;
  }
}

main().catch((error) => {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
});
