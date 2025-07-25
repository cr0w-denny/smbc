#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import { getPackages } from "@manypkg/get-packages";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Configuration
const SONATYPE_REGISTRY =
  process.env.SONATYPE_REGISTRY || "https://registry.npmjs.org"; // Replace with your Sonatype URL
const DRY_RUN = process.argv.includes("--dry-run");
const SCOPE = "@smbc";

console.log(`Publishing to: ${SONATYPE_REGISTRY}`);
console.log(`Dry run: ${DRY_RUN}`);

// Get packages in dependency order using changesets
async function getPackagesInOrder() {
  try {
    const { packages } = await getPackages(rootDir);

    // Get only SMBC packages
    const smbcPackages = packages.filter((pkg) =>
      pkg.packageJson.name?.startsWith(SCOPE),
    );

    // Simple topological sort based on dependencies
    const sorted = [];
    const visited = new Set();

    function visit(pkgName) {
      if (visited.has(pkgName)) return;
      visited.add(pkgName);

      const pkg = smbcPackages.find((p) => p.packageJson.name === pkgName);
      if (!pkg) return;

      // Visit dependencies first
      const deps = [
        ...Object.keys(pkg.packageJson.dependencies || {}),
        ...Object.keys(pkg.packageJson.devDependencies || {}),
        ...Object.keys(pkg.packageJson.peerDependencies || {}),
      ].filter((dep) => dep.startsWith(SCOPE));

      // Visit each dependency
      deps.forEach((dep) => visit(dep));

      // Add this package after its dependencies
      if (!sorted.find((p) => p.name === pkg.packageJson.name)) {
        sorted.push({
          path: join(pkg.dir, "package.json"),
          dir: pkg.dir,
          content: pkg.packageJson,
          name: pkg.packageJson.name,
        });
      }
    }

    // Visit all packages
    smbcPackages.forEach((pkg) => visit(pkg.packageJson.name));

    console.log("\nPackages will be published in this order:");
    sorted.forEach((pkg, i) => console.log(`  ${i + 1}. ${pkg.name}`));

    return sorted;
  } catch (error) {
    console.warn(
      "Could not determine dependency order, falling back to manual order",
    );
    console.warn(error.message);
    return getSmbcPackages();
  }
}

// Get all @smbc packages (fallback method)
const getSmbcPackages = () => {
  const patterns = [
    "packages/*/package.json",
    "applets/*/mui/package.json",
    "applets/*/api/package.json",
  ];

  const packages = [];
  for (const pattern of patterns) {
    const files = glob.sync(pattern, { cwd: rootDir });
    packages.push(...files);
  }

  return packages
    .map((file) => {
      const fullPath = join(rootDir, file);
      const content = JSON.parse(readFileSync(fullPath, "utf8"));
      return {
        path: fullPath,
        dir: dirname(fullPath),
        content,
        name: content.name,
      };
    })
    .filter((pkg) => pkg.name && pkg.name.startsWith(SCOPE))
    .sort((a, b) => {
      // Ensure dependencies are published first
      const order = [
        "ui-core",
        "applet-meta",
        "typespec-core",
        "vite-config",
        "dataview",
        "applet-core",
        "mui-components",
        "dataview-mui",
        "dataview-ag-grid",
        "mui-applet-core",
        "applet-host",
        "mui-applet-devtools",
        "openapi-msw",
        "markdown-json",
        "applet-cli",
        "create-applet",
        "create-host-app",
      ];

      const aIndex = order.findIndex((name) => a.name.includes(name));
      const bIndex = order.findIndex((name) => b.name.includes(name));

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

// Update package.json for Sonatype publishing
const updatePackageJson = (pkg) => {
  const updates = {
    ...pkg.content,
    publishConfig: {
      ...pkg.content.publishConfig,
      registry: SONATYPE_REGISTRY,
      access: "public",
    },
  };

  // Remove local registry reference if present
  if (updates.publishConfig.registry === "http://localhost:4873") {
    updates.publishConfig.registry = SONATYPE_REGISTRY;
  }

  // Ensure proper repository field
  if (!updates.repository) {
    updates.repository = {
      type: "git",
      url: "https://github.com/.../smbc.git",
      directory: pkg.dir.replace(rootDir + "/", ""),
    };
  }

  // Add/update homepage
  if (!updates.homepage) {
    updates.homepage = "https://github.com/.../smbc";
  }

  return updates;
};

// Build all packages first
console.log("\n📦 Building all packages...");
try {
  execSync("npm run build", { cwd: rootDir, stdio: "inherit" });
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}

// Get packages to publish
const packages = await getPackagesInOrder();
console.log(`\nFound ${packages.length} packages to publish:`);
packages.forEach((pkg) => console.log(`  - ${pkg.name}`));

// Update and publish each package
let publishedCount = 0;
let skippedCount = 0;
const errors = [];
const results = {
  published: [],
  skipped: [],
  errors: [],
};

for (const pkg of packages) {
  console.log(`\n📄 Processing ${pkg.name}...`);

  try {
    // Update package.json
    const updated = updatePackageJson(pkg);

    if (DRY_RUN) {
      console.log("  Would update package.json with:");
      console.log(
        `    publishConfig.registry: ${updated.publishConfig.registry}`,
      );
      console.log(`    repository: ${JSON.stringify(updated.repository)}`);
    } else {
      // Backup original
      const backupPath = pkg.path + ".backup";
      writeFileSync(backupPath, JSON.stringify(pkg.content, null, 2));

      // Write updated package.json
      writeFileSync(pkg.path, JSON.stringify(updated, null, 2));

      try {
        // Check current published version vs local version
        const currentVersionCmd = `npm view ${pkg.name} version --registry ${SONATYPE_REGISTRY} 2>/dev/null || echo "NOT_FOUND"`;
        const publishedVersion = execSync(currentVersionCmd, {
          cwd: pkg.dir,
          encoding: "utf8",
        }).trim();

        if (
          publishedVersion !== "NOT_FOUND" &&
          publishedVersion === updated.version
        ) {
          console.log(
            `  ⏭️  ${pkg.name}@${updated.version} - no version change, skipping...`,
          );
          // Restore backup
          writeFileSync(pkg.path, readFileSync(backupPath, "utf8"));
          execSync(`rm ${backupPath}`);
          skippedCount++;
          results.skipped.push({
            name: pkg.name,
            version: updated.version,
            reason: "No version change",
          });
          continue;
        }

        if (publishedVersion !== "NOT_FOUND") {
          console.log(
            `  🔄 ${pkg.name}: ${publishedVersion} → ${updated.version}`,
          );
        } else {
          console.log(`  🆕 ${pkg.name}@${updated.version} - first publish`);
        }

        // Publish
        console.log(`  📤 Publishing ${pkg.name}@${updated.version}...`);
        execSync(`npm publish --registry ${SONATYPE_REGISTRY}`, {
          cwd: pkg.dir,
          stdio: "inherit",
          env: { ...process.env, npm_config_registry: SONATYPE_REGISTRY },
        });

        publishedCount++;
        console.log(`  ✅ Published successfully!`);

        results.published.push({
          name: pkg.name,
          version: updated.version,
          previousVersion:
            publishedVersion !== "NOT_FOUND" ? publishedVersion : null,
        });

        // Restore original package.json
        writeFileSync(pkg.path, readFileSync(backupPath, "utf8"));
        execSync(`rm ${backupPath}`);
      } catch (publishError) {
        // Restore backup on error
        writeFileSync(pkg.path, readFileSync(backupPath, "utf8"));
        execSync(`rm ${backupPath}`);
        throw publishError;
      }
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    errors.push({ package: pkg.name, error: error.message });
    results.errors.push({
      name: pkg.name,
      error: error.message,
    });
  }
}

// Summary
console.log("\n📊 Summary:");
console.log(`  Total packages: ${packages.length}`);
console.log(`  Published: ${publishedCount}`);
console.log(`  Skipped: ${skippedCount}`);
console.log(`  Errors: ${errors.length}`);

if (results.published.length > 0) {
  console.log("\n✅ Published packages:");
  results.published.forEach(({ name, version, previousVersion }) => {
    if (previousVersion) {
      console.log(`  - ${name}: ${previousVersion} → ${version}`);
    } else {
      console.log(`  - ${name}: ${version} (first publish)`);
    }
  });
}

if (results.skipped.length > 0) {
  console.log("\n⏭️  Skipped packages:");
  results.skipped.forEach(({ name, version, reason }) => {
    console.log(`  - ${name}@${version} (${reason})`);
  });
}

if (errors.length > 0) {
  console.log("\n❌ Errors:");
  errors.forEach(({ package: pkgName, error }) => {
    console.log(`  - ${pkgName}: ${error}`);
  });
  process.exit(1);
}

if (DRY_RUN) {
  console.log(
    "\n✨ Dry run completed. Run without --dry-run to actually publish.",
  );
} else {
  console.log("\n✨ Publishing completed!");

  if (publishedCount === 0 && skippedCount > 0) {
    console.log("🎯 All packages are up to date - no publishing needed!");
  }
}
