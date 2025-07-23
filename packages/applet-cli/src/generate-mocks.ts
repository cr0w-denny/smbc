#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";
import { createRequire } from "module";

/**
 * Generate MSW mocks for all applets configured in the host application
 *
 * This script:
 * 1. Reads src/applet.config.ts to discover installed applets (fixed pattern)
 * 2. Finds API packages using @smbc/{applet}-api pattern (fixed pattern)
 * 3. Generates MSW mocks using @smbc/openapi-msw for each API
 * 4. Combines all mocks into src/mocks/index.ts with a useMockSetup() hook
 */

interface ApiPackageInfo {
  exists: boolean;
  packageName: string;
  packageJsonPath?: string;
}

interface AppletWithApi {
  appletId: string;
  apiPackage: ApiPackageInfo;
}

interface GeneratedMock {
  appletId: string;
  outputPath: string;
  packageName: string;
}

const CWD = process.cwd();
const MOCKS_DIR = join(CWD, "src/generated/mocks");
const MOCKS_INDEX = join(MOCKS_DIR, "index.ts");

/**
 * Extract applet IDs from applet.config.ts for monorepo or npm packages
 */
async function extractAppletIds(): Promise<string[]> {
  // First try reading from applet.config.ts (monorepo case)
  const configPath = join(CWD, "src/applet.config.ts");
  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, "utf-8");
      
      // Extract applet IDs from the APPLETS array
      const appletIds: string[] = [];
      const mountAppletMatches = configContent.matchAll(/mountApplet\([^,]+,\s*{\s*id:\s*["']([^"']+)["']/g);
      for (const match of mountAppletMatches) {
        appletIds.push(match[1]);
      }
      
      // Also look for manual applet definitions with id property in APPLETS array
      const appletsArrayMatch = configContent.match(/export const APPLETS[^=]*=\s*\[([^\]]+)\]/s);
      if (appletsArrayMatch) {
        const appletsArrayContent = appletsArrayMatch[1];
        const idMatches = appletsArrayContent.matchAll(/{\s*id:\s*["']([^"']+)["']/g);
        for (const idMatch of idMatches) {
          if (!appletIds.includes(idMatch[1])) {
            appletIds.push(idMatch[1]);
          }
        }
      }
      
      if (appletIds.length > 0) {
        console.log(`📋 Found ${appletIds.length} applets in config: ${appletIds.join(", ")}`);
        return appletIds;
      }
    } catch (error) {
      console.warn("⚠️  Could not parse applet.config.ts:", (error as Error).message);
    }
  }

  // Fallback to npm package discovery
  try {
    const { getInstalledApplets } = await import("./applet-discovery.js");
    const installedApplets = getInstalledApplets();
    const appletIds = installedApplets.map((applet) => applet.metadata.id);
    
    if (appletIds.length > 0) {
      console.log(`📋 Found ${appletIds.length} applets via npm: ${appletIds.join(", ")}`);
      return appletIds;
    }
  } catch (error) {
    console.warn("⚠️  Could not discover via npm:", (error as Error).message);
  }

  console.error("❌ No applets found via config file or npm packages");
  console.error("💡 Make sure you have applets configured in src/applet.config.ts or installed as packages");
  process.exit(1);
}

/**
 * Check if an API package exists for the given applet (monorepo or npm)
 */
function checkApiPackageExists(appletId: string): ApiPackageInfo {
  const packageName = `@smbc/${appletId}-api`;

  // First check for monorepo structure: ../../applets/{appletId}/api/
  const monorepoApiPath = resolve(CWD, "..", "..", "applets", appletId, "api");
  const monorepoPackageJsonPath = join(monorepoApiPath, "package.json");
  
  if (existsSync(monorepoPackageJsonPath)) {
    console.log(`✅ Found API package ${packageName} in monorepo at ${monorepoPackageJsonPath}`);
    return { exists: true, packageName, packageJsonPath: monorepoPackageJsonPath };
  }

  // Fallback to npm package resolution
  try {
    // Try to resolve the package main entry point first
    const require = createRequire(resolve(CWD, "package.json"));
    const packageMainPath = require.resolve(packageName);

    // Find the package root by looking for node_modules/packageName pattern
    const nodeModulesIndex = packageMainPath.indexOf("node_modules");
    if (nodeModulesIndex === -1) {
      console.log(`❌ Could not find node_modules path in ${packageMainPath}`);
      return { exists: false, packageName };
    }

    // Navigate to the package root directory
    const packageRoot = resolve(
      packageMainPath.substring(0, nodeModulesIndex),
      "node_modules",
      packageName,
    );
    const packageJsonPath = resolve(packageRoot, "package.json");

    if (existsSync(packageJsonPath)) {
      console.log(`✅ Found API package ${packageName} at ${packageJsonPath}`);
      return { exists: true, packageName, packageJsonPath };
    } else {
      console.log(
        `❌ Package ${packageName} found but no package.json at ${packageJsonPath}`,
      );
      return { exists: false, packageName };
    }
  } catch (error) {
    console.log(
      `❌ Could not resolve ${packageName}:`,
      (error as Error).message,
    );
    return { exists: false, packageName };
  }
}

/**
 * Generate mocks for a specific applet using openapi-msw
 */
function generateAppletMocks(
  appletId: string,
  apiPackage: ApiPackageInfo,
): GeneratedMock | null {
  console.log(`🔧 Generating mocks for ${appletId}...`);

  try {
    // Use the openapi-msw CLI to generate mocks
    const outputPath = join(MOCKS_DIR, `${appletId}.ts`);

    // Find the OpenAPI spec file in the API package
    const apiPackageDir = apiPackage.packageJsonPath!.replace(
      "/package.json",
      "",
    );
    let specPath = join(
      apiPackageDir,
      "dist/@typespec/openapi3/openapi.json",
    );

    // For monorepo case, also try the tsp-output directory
    if (!existsSync(specPath)) {
      const alternativeSpecPath = join(
        apiPackageDir,
        "tsp-output/@typespec/openapi3/openapi.json",
      );
      if (existsSync(alternativeSpecPath)) {
        specPath = alternativeSpecPath;
      }
    }

    if (!existsSync(specPath)) {
      console.error(`❌ OpenAPI spec not found at ${specPath}`);
      console.error(`💡 Try running 'npm run build:api' or 'tsp compile' in the API directory`);
      return null;
    }

    // Read the OpenAPI spec to extract the mock server URL
    let baseUrl = '';
    try {
      const specContent = JSON.parse(readFileSync(specPath, 'utf-8'));
      const mockServer = specContent.servers?.find((server: any) => 
        server.description?.toLowerCase() === 'mock'
      );
      if (mockServer) {
        baseUrl = mockServer.url;
        console.log(`   Using mock server URL: ${baseUrl}`);
      }
    } catch (error) {
      console.warn(`   Could not read mock server URL from spec: ${error}`);
    }

    // Create the command to generate mocks using the OpenAPI spec file
    const command = baseUrl 
      ? `npx @smbc/openapi-msw generate --input ${specPath} --output ${outputPath} --base-url ${baseUrl}`
      : `npx @smbc/openapi-msw generate --input ${specPath} --output ${outputPath}`;

    console.log(`   Running: ${command}`);
    execSync(command, { stdio: "inherit", cwd: CWD });

    console.log(`✅ Generated mocks for ${appletId} at ${outputPath}`);
    return { appletId, outputPath, packageName: apiPackage.packageName };
  } catch (error) {
    console.error(
      `❌ Failed to generate mocks for ${appletId}:`,
      (error as Error).message,
    );
    return null;
  }
}

/**
 * Create the main mocks index file with useMockSetup hook
 */
function createMocksIndex(generatedMocks: GeneratedMock[]): void {
  console.log("📝 Creating mocks index file...");

  // Create mocks directory if it doesn't exist
  if (!existsSync(MOCKS_DIR)) {
    execSync(`mkdir -p ${MOCKS_DIR}`, { cwd: CWD });
  }

  const imports = generatedMocks
    .map(
      (mock) => {
        const handlerName = mock.appletId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        return `import { handlers as ${handlerName}Handlers } from './${mock.appletId}';`;
      }
    )
    .join("\n");

  const handlersArray = generatedMocks
    .map((mock) => {
      const handlerName = mock.appletId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return `  ...${handlerName}Handlers,`;
    })
    .join("\n");

  const content = `// Auto-generated mock handlers for all configured applets
// Generated by: npm run generate-mocks
// Do not edit this file manually

import React from 'react';
${imports}

/**
 * All MSW handlers for configured applets
 */
export const allHandlers = [
${handlersArray}
];

// Also export as 'handlers' for compatibility
export const handlers = allHandlers;

/**
 * Hook for setting up MSW mocks in host applications
 * 
 * @example
 * \`\`\`tsx
 * import { useMockSetup } from './mocks';
 * 
 * function App() {
 *   const { isReady, error } = useMockSetup(mockEnabled);
 *   
 *   if (mockEnabled && !isReady) {
 *     return <div>Setting up mocks...</div>;
 *   }
 *   
 *   return <YourApp />;
 * }
 * \`\`\`
 */
export function useMockSetup(enabled: boolean = true) {
  const [isReady, setIsReady] = React.useState(!enabled);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setIsReady(true);
      setError(null);
      return;
    }

    async function setupMocks() {
      try {
        const { setupWorker } = await import('msw/browser');
        const worker = setupWorker(...handlers);
        
        await worker.start({
          onUnhandledRequest: 'warn',
          serviceWorker: {
            url: \`\${import.meta.env.BASE_URL || '/'}mockServiceWorker.js\`,
          },
        });
        
        console.log('🎭 MSW worker started with handlers:', handlers.length);
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to setup MSW:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsReady(false);
      }
    }

    setupMocks();
  }, [enabled]);

  return { isReady, error };
}

// Export individual handler sets for advanced usage
export {${generatedMocks
    .map((mock) => {
      const handlerName = mock.appletId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return `\n  ${handlerName}Handlers,`;
    })
    .join("")}
};

/**
 * Metadata about generated mocks
 */
export const mockMetadata = {
  generatedAt: '${new Date().toISOString()}',
  applets: [${generatedMocks
    .map(
      (mock) => `
    {
      id: '${mock.appletId}',
      packageName: '${mock.packageName}',
      handlersCount: ${mock.appletId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Handlers.length,
    },`,
    )
    .join("")}
  ],
};
`;

  writeFileSync(MOCKS_INDEX, content, "utf-8");
  console.log(`✅ Created mocks index at ${MOCKS_INDEX}`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log("🚀 Generating mocks for host application...");
  console.log("📂 Working directory:", CWD);

  // Step 1: Extract applet IDs from config
  const appletIds = await extractAppletIds();
  console.log(`📋 Found ${appletIds.length} applets:`, appletIds);

  if (appletIds.length === 0) {
    console.log("ℹ️  No applets found in configuration. Nothing to generate.");
    return;
  }

  // Step 2: Check which applets have API packages
  const appletsWithApis: AppletWithApi[] = [];
  for (const appletId of appletIds) {
    const apiPackage = checkApiPackageExists(appletId);
    if (apiPackage.exists) {
      appletsWithApis.push({ appletId, apiPackage });
    } else {
      console.log(
        `⚠️  No API package found for ${appletId} (${apiPackage.packageName})`,
      );
    }
  }

  if (appletsWithApis.length === 0) {
    console.log("ℹ️  No API packages found. Nothing to generate.");
    return;
  }

  // Step 3: Generate mocks for each applet with an API
  const generatedMocks: GeneratedMock[] = [];
  for (const { appletId, apiPackage } of appletsWithApis) {
    const result = generateAppletMocks(appletId, apiPackage);
    if (result) {
      generatedMocks.push(result);
    }
  }

  if (generatedMocks.length === 0) {
    console.log("❌ No mocks were successfully generated.");
    return;
  }

  // Step 4: Create the index file
  createMocksIndex(generatedMocks);

  console.log(
    `🎉 Successfully generated mocks for ${generatedMocks.length} applets!`,
  );
  console.log("\n📖 Next steps:");
  console.log("   1. Import { useMockSetup } from './src/mocks' in your app");
  console.log("   2. Call useMockSetup(mockEnabled) to set up MSW");
  console.log("   3. Ensure mockServiceWorker.js is in your public directory");
  console.log("\n💡 To regenerate mocks, run: npm run generate-mocks");
}

// Run the script
main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});
