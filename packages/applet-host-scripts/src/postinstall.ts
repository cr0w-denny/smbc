#!/usr/bin/env node

/**
 * Post-install script for @smbc/applet-host
 * 
 * This script runs after installation to:
 * 1. Detect the framework being used (mui, react-native, etc.)
 * 2. Check if applet.config.ts already exists
 * 3. If not, create it with interactive prompts for framework-specific applets
 * 4. Install and configure selected applets
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { APPLET_METADATA, getAppletsByFramework } from '@smbc/applet-meta';
import readline from 'readline';
import { spawn } from 'child_process';

// Check if we're in a CI environment or should skip interactive setup
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
const skipSetup = process.env.SKIP_APPLET_SETUP === 'true';

if (isCI || skipSetup) {
  console.log('⏭️  Skipping interactive setup (CI environment or SKIP_APPLET_SETUP=true)');
  process.exit(0);
}

// Ensure tsx is installed as a dev dependency
async function ensureTsxInstalled(): Promise<void> {
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      return;
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const hasTsx = packageJson.devDependencies?.tsx || packageJson.dependencies?.tsx;
    
    if (!hasTsx) {
      console.log('📦 Installing tsx for TypeScript script execution...');
      
      await new Promise((resolve, reject) => {
        const child = spawn('npm', ['install', '--save-dev', 'tsx'], { stdio: 'inherit' });
        child.on('close', (code) => {
          if (code === 0) {
            console.log('✅ tsx installed successfully');
            resolve(undefined);
          } else {
            reject(new Error(`Failed to install tsx`));
          }
        });
      });
    }
  } catch (error) {
    console.warn('⚠️  Could not install tsx automatically:', error);
    console.log('💡 Please install tsx manually: npm install --save-dev tsx');
  }
}

// Run tsx installation first
ensureTsxInstalled().then(() => {
  // Continue with the rest of the postinstall script
  main();
}).catch(console.error);

async function main() {
  // Check if applet.config.ts already exists
  const configPath = resolve(process.cwd(), 'src/applet.config.ts');
  const configExists = existsSync(configPath);

  if (configExists) {
    console.log('✅ applet.config.ts already exists, skipping setup');
    process.exit(0);
  }

// Detect framework from package.json dependencies
function detectFramework(): string {
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      return 'unknown';
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies
    };
    
    // Check for MUI
    if (allDeps['@mui/material'] || allDeps['@smbc/mui-applet-core']) {
      return 'mui';
    }
    
    // Check for React Native (future)
    if (allDeps['react-native']) {
      return 'react-native';
    }
    
    // Default to unknown
    return 'unknown';
  } catch (error) {
    console.warn('Could not detect framework:', (error as Error).message);
    return 'unknown';
  }
}

// Simple readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main(): Promise<void> {
  try {
    const framework = detectFramework();
    
    console.log('🚀 SMBC Applet Configuration Setup');
    console.log('==================================');
    console.log('');
    
    if (framework === 'unknown') {
      console.log('⚠️  Could not detect framework. Please ensure you have @mui/material or similar installed.');
      console.log('   You can still create a basic config and add applets manually later.');
      console.log('');
    } else {
      console.log(`🎯 Detected framework: ${framework}`);
      console.log('');
    }
    
    // Get available applets for this framework
    const appletsArray = framework !== 'unknown' ? getAppletsByFramework(framework) : [];
    const availableApplets = appletsArray.reduce((acc: Record<string, any>, applet: any) => {
      acc[applet.packageName] = applet;
      return acc;
    }, {} as Record<string, any>);
    const appletKeys = Object.keys(availableApplets);
    
    if (appletKeys.length === 0) {
      console.log('📦 No applets available for this framework. Creating minimal config...');
      
      // Create src directory if it doesn't exist
      const srcDir = resolve(process.cwd(), 'src');
      if (!existsSync(srcDir)) {
        mkdirSync(srcDir, { recursive: true });
      }
      
      // Generate minimal config
      const config = generateMinimalConfig(framework);
      writeFileSync(configPath, config);
      
      console.log('✅ Created minimal applet.config.ts');
      console.log('');
      console.log('Add applets manually by:');
      console.log('1. Installing applet packages');
      console.log('2. Adding imports and configuration to applet.config.ts');
      
      rl.close();
      return;
    }
    
    // Show available applets
    console.log(`📦 Available ${framework} applets:`);
    appletKeys.forEach((key, index) => {
      const applet = availableApplets[key];
      console.log(`${index + 1}. ${applet.name} - ${applet.description}`);
    });
    console.log('');
    
    // Get selected applets
    const selection = await prompt('Select applets (comma-separated numbers, e.g., "1,3", or press Enter for none): ');
    const selectedIndices = selection.trim() ? 
      selection.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < appletKeys.length) : 
      [];
    
    const selectedApplets = selectedIndices.map(i => appletKeys[i]);
    
    // Create src directory if it doesn't exist
    const srcDir = resolve(process.cwd(), 'src');
    if (!existsSync(srcDir)) {
      mkdirSync(srcDir, { recursive: true });
    }
    
    // Create generated directory if it doesn't exist
    const generatedDir = resolve(process.cwd(), 'src/generated');
    if (!existsSync(generatedDir)) {
      mkdirSync(generatedDir, { recursive: true });
    }
    
    // Generate metadata file
    const metadata = generateMetadata(selectedApplets, availableApplets);
    const metadataPath = resolve(process.cwd(), 'src/generated/metadata.js');
    writeFileSync(metadataPath, metadata);
    
    // Generate config
    const config = generateConfig(framework, selectedApplets, availableApplets);
    
    // Write config file
    writeFileSync(configPath, config);
    
    console.log('');
    console.log('✅ Created applet.config.ts');
    console.log('✅ Created generated/metadata.js');
    
    // Install selected applets
    if (selectedApplets.length > 0) {
      console.log('');
      console.log('📦 Installing applets...');
      
      // Check if we have npm or yarn
      const useYarn = existsSync(resolve(process.cwd(), 'yarn.lock'));
      const packageManager = useYarn ? 'yarn' : 'npm';
      const installCmd = useYarn ? 'add' : 'install';
      
      const installProcess = spawn(packageManager, [installCmd, ...selectedApplets], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('');
          console.log('🎉 Setup complete!');
          console.log('');
          console.log('Your applets are now configured and ready to use!');
        } else {
          console.log('');
          console.log('⚠️  Applet installation failed. You can install them manually:');
          selectedApplets.forEach(applet => {
            console.log(`   ${packageManager} ${installCmd} ${applet}`);
          });
        }
        rl.close();
      });
    } else {
      console.log('');
      console.log('🎉 Setup complete!');
      console.log('');
      console.log('Add applets later by:');
      console.log('1. Installing applet packages');
      console.log('2. Adding them to the APPLETS array in applet.config.ts');
      rl.close();
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', (error as Error).message);
    rl.close();
    process.exit(1);
  }
}

function generateMinimalConfig(framework: string): string {
  return `import type {
  RoleConfig,
  AppletMount,
} from "@smbc/applet-core";
import {
  generatePermissionMappings,
  createPermissionRequirements,
  mountApplet,
} from "@smbc/applet-core";

// =============================================================================
// APPLET CONFIGURATION
// =============================================================================

export const APPLETS: AppletMount[] = [
  // Add your applets here
];

// =============================================================================
// HOST CONFIGURATION
// =============================================================================

export const HOST = {
  drawerWidth: 240,
} as const;

export const HOST_ROLES = [
  "Guest",
  "User", 
  "Admin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@example.com",
  name: "Demo User",
  roles: ["User"],
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
};

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

const permissionRequirements = createPermissionRequirements({
  // Add permission requirements here
});

export const ROLE_CONFIG: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

// =============================================================================
// METADATA (Used by tooling - do not modify)
// =============================================================================

export const __APPLET_METADATA__ = {
  version: "1.0.0",
  generated: "${new Date().toISOString()}",
  framework: "${framework}",
  applets: {}
};
`;
}

function generateMetadata(selectedApplets: string[], availableApplets: Record<string, any>): string {
  return `// Auto-generated applet metadata
// Do not edit this file manually - regenerate by running setup

import { getServerUrl } from '@smbc/applet-core';

export const APPLET_METADATA = {
${selectedApplets.map(pkg => {
  const applet = availableApplets[pkg];
  // Extract version from the applet package
  let version = "0.0.0";
  try {
    const appletPackageJsonPath = require.resolve(`${pkg}/package.json`);
    const appletPackageJson = JSON.parse(readFileSync(appletPackageJsonPath, 'utf8'));
    version = appletPackageJson.version || "0.0.0";
  } catch (error) {
    console.warn(`Could not read version for ${pkg}, using 0.0.0`);
  }
  
  return `  "${pkg}": {
    id: "${applet.path.slice(1)}",
    name: "${applet.name}",
    description: "${applet.description}",
    icon: "${applet.icon}",
    path: "${applet.path}",
    version: "${version}",
    permissions: [${applet.permissions.map((p: string) => `"${p}"`).join(', ')}],
    packageName: "${pkg}",
  },`;
}).join('\n')}
};

/**
 * Helper function to mount an applet using its metadata
 */
export function mountFromMeta(applet, packageName, environment = 'development', apiServers) {
  const meta = APPLET_METADATA[packageName];
  if (!meta) {
    throw new Error("No metadata found for package: " + packageName);
  }
  
  const apiBaseUrl = getServerUrl(meta.id, environment, apiServers);
  
  return {
    id: meta.id,
    label: meta.name,
    routes: [{
      path: meta.path,
      label: meta.name,
      component: applet.component,
      requiredPermissions: [],
    }],
    permissions: {}, // Configure as needed - Record<string, string>
    apiSpec: applet.apiSpec,
    apiBaseUrl,
    version: meta.version,
  };
}
`;
}

function generateConfig(framework: string, selectedApplets: string[], availableApplets: Record<string, any>): string {
  const imports = selectedApplets.map(pkg => {
    const applet = availableApplets[pkg];
    return `import ${applet.exportName} from '${pkg}';`;
  }).join('\n');
  
  const iconImports = selectedApplets.map(pkg => {
    const applet = availableApplets[pkg];
    return applet.icon;
  }).filter((icon, index, arr) => arr.indexOf(icon) === index);
  
  const iconImportLine = iconImports.length > 0 ? 
    `import { ${iconImports.join(', ')} } from '@mui/icons-material';` : 
    '';
  
  const appletConfigs = selectedApplets.map(pkg => {
    const applet = availableApplets[pkg];
    const iconName = applet.icon;
    const appletVarName = applet.exportName;
    return `  mountApplet(${appletVarName}, {
    id: "${applet.path.slice(1)}",
    label: "${applet.name}",
    path: "${applet.path}",
    icon: ${iconName},
    permissions: [],
    version: "0.0.0", // Version will be populated from package.json
  }),`;
  }).join('\n');
  
  const permissionConfigs = selectedApplets.map(pkg => {
    const applet = availableApplets[pkg];
    const appletVarName = applet.exportName;
    return `  "${applet.path.slice(1)}": {
    applet: ${appletVarName},
    permissions: {
      // Add your permission mappings here
    },
  },`;
  }).join('\n');
  
  return `import type {
  RoleConfig,
  AppletMount,
} from "@smbc/applet-core";
import {
  generatePermissionMappings,
  createPermissionRequirements,
} from "@smbc/applet-core";
import { mountFromMeta, APPLET_METADATA } from "./generated/metadata.js";
import { DEFAULT_API_SERVERS } from "./generated/api-servers.js";
${iconImportLine}

// Import applets
${imports}

// =============================================================================
// API SERVER CONFIGURATION
// =============================================================================

// Override default server configurations for your deployment
export const API_SERVER_OVERRIDES = {
  // Example: Override usage-stats servers for custom backend
  // "usage-stats": {
  //   development: "http://my-custom-backend:3001/usage-stats",
  //   production: "https://my-api.company.com/usage-stats"
  // }
};

// Merged API servers (defaults + overrides)
export const API_SERVERS = { ...DEFAULT_API_SERVERS, ...API_SERVER_OVERRIDES };

// =============================================================================
// APPLET CONFIGURATION
// =============================================================================

export const APPLETS: AppletMount[] = [
${selectedApplets.map(pkg => {
  const applet = availableApplets[pkg];
  return `  [${applet.exportName}, "${pkg}"] as const,`;
}).join('\n')}
].map(([applet, packageName]) => mountFromMeta(applet, packageName, 'development', API_SERVERS));

// =============================================================================
// NAVIGATION HELPER
// =============================================================================

// For basic navigation menu and routing, you can import from @smbc/applet-host:
// import { AppletHost, AppletMenu, AppletRouter } from '@smbc/applet-host';
// import { APPLETS } from './applet.config';
// 
// Usage:
// function App() {
//   return (
//     <AppletHost>
//       <div style={{ display: 'flex' }}>
//         <AppletMenu applets={APPLETS} />
//         <AppletRouter applets={APPLETS} />
//       </div>
//     </AppletHost>
//   );
// }
// 
// AppletHost provides all necessary context providers for applets

// =============================================================================
// HOST CONFIGURATION
// =============================================================================

export const HOST = {
  drawerWidth: 240,
} as const;

export const HOST_ROLES = [
  "Guest",
  "User",
  "Admin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const demoUser = {
  id: "1",
  email: "user@example.com",
  name: "Demo User",
  roles: ["User"],
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
};

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

const permissionRequirements = createPermissionRequirements({
${permissionConfigs}
});

export const ROLE_CONFIG: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

`;
}

}