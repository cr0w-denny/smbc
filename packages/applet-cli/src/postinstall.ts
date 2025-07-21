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
import { getAppletsByFramework } from './applet-discovery.js';
import readline from 'readline';
import { spawn } from 'child_process';

// Check if we're running in a monorepo context (skip if we're in a generated host app)
const isInMonorepo = (() => {
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      // If this is a generated host app, don't skip
      if (packageJson.smbc?.host) {
        return false;
      }
    }
    
    // Look for SMBC monorepo by checking for packages/applet-core
    return existsSync(resolve(process.cwd(), 'packages/applet-core'));
  } catch {
    return false;
  }
})();

if (isInMonorepo) {
  console.log('⏭️  Skipping applet-postinstall (running in monorepo context)');
  process.exit(0);
}

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
  setupApplets();
}).catch(console.error);

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

async function setupApplets(): Promise<void> {
  try {
    // Check if applet.config.ts already exists
    const configPath = resolve(process.cwd(), 'src/applet.config.ts');
    const configExists = existsSync(configPath);

    if (configExists) {
      console.log('✅ applet.config.ts already exists, skipping setup');
      process.exit(0);
    }

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
    
    // Get available applets for this framework from npm discovery
    const availableApplets = getAppletsByFramework(framework);
    const appletKeys = availableApplets.map(applet => applet.packageName);
    
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
    availableApplets.forEach((applet, index) => {
      console.log(`${index + 1}. ${applet.metadata.name} - ${applet.metadata.description}`);
    });
    console.log('');
    
    // Get selected applets
    const selection = await prompt('Select applets (comma-separated numbers, e.g., "1,3", or press Enter for none): ');
    const selectedIndices = selection.trim() ? 
      selection.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < availableApplets.length) : 
      [];
    
    const selectedApplets = selectedIndices.map(i => availableApplets[i]);
    
    // Create src directory if it doesn't exist
    const srcDir = resolve(process.cwd(), 'src');
    if (!existsSync(srcDir)) {
      mkdirSync(srcDir, { recursive: true });
    }
    
    // Generate config
    const config = generateConfig(framework, selectedApplets);
    
    // Write config file
    writeFileSync(configPath, config);
    
    console.log('');
    console.log('✅ Created applet.config.ts');
    
    // Install selected applets
    if (selectedApplets.length > 0) {
      console.log('');
      console.log('📦 Installing applets...');
      
      // Check if we have npm or yarn
      const useYarn = existsSync(resolve(process.cwd(), 'yarn.lock'));
      const packageManager = useYarn ? 'yarn' : 'npm';
      const installCmd = useYarn ? 'add' : 'install';
      
      const packageNames = selectedApplets.map(applet => applet.packageName);
      const installProcess = spawn(packageManager, [installCmd, ...packageNames], {
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
            console.log(`   ${packageManager} ${installCmd} ${applet.packageName}`);
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
  createMinRole,
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

// Create type-safe minRole function
const minRole = createMinRole(HOST_ROLES);

const permissionRequirements = createPermissionRequirements({
  // Add permission requirements here
  // Example:
  // "applet-id": minRole(appletName, {
  //   PERMISSION_KEY: "User",
  // }),
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


function generateConfig(framework: string, selectedApplets: any[]): string {
  const imports = selectedApplets.map(applet => {
    return `import ${applet.metadata.exportName} from '${applet.packageName}';`;
  }).join('\n');
  
  const iconImports = selectedApplets.map(applet => {
    return applet.metadata.icon;
  }).filter((icon, index, arr) => arr.indexOf(icon) === index);
  
  const iconImportLine = iconImports.length > 0 ? 
    `import { ${iconImports.join(', ')} } from '@mui/icons-material';` : 
    '';
  
  const appletConfigs = selectedApplets.map(applet => {
    const iconName = applet.metadata.icon;
    const appletVarName = applet.metadata.exportName;
    return `  mountApplet(${appletVarName}, {
    id: "${applet.metadata.id}",
    label: "${applet.metadata.name}",
    path: "${applet.metadata.path}",
    icon: ${iconName},
    permissions: [],
    version: "0.0.0", // Will be read from package.json at runtime
  }),`;
  }).join('\n');
  
  const permissionConfigs = selectedApplets.map(applet => {
    const appletVarName = applet.metadata.exportName;
    const permissions = applet.metadata.permissions || [];
    
    if (permissions.length === 0) {
      return `  "${applet.metadata.id}": minRole(${appletVarName}, {
    // No permissions required for this applet
  }),`;
    }
    
    const permMappings = permissions.map((perm: string) => {
      // Assign sensible default roles based on permission name patterns
      let defaultRole = 'User';
      if (perm.includes('VIEW') || perm.includes('READ')) {
        defaultRole = 'Guest';
      } else if (perm.includes('DELETE') || perm.includes('MANAGE') || perm.includes('ADMIN') || perm.includes('EXPORT')) {
        defaultRole = 'Admin';
      }
      return `    ${perm}: "${defaultRole}",`;
    }).join('\n');
    
    return `  "${applet.metadata.id}": minRole(${appletVarName}, {
${permMappings}
  }),`;
  }).join('\n');
  
  return `import type {
  RoleConfig,
  AppletMount,
} from "@smbc/applet-core";
import {
  generatePermissionMappings,
  createPermissionRequirements,
  createMinRole,
  mountApplet,
} from "@smbc/applet-core";
${iconImportLine}

// Import applets
${imports}

// =============================================================================
// APPLET CONFIGURATION
// =============================================================================

export const APPLETS: AppletMount[] = [
${appletConfigs}
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

// Create type-safe minRole function
const minRole = createMinRole(HOST_ROLES);

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

// =============================================================================
// METADATA (Used by tooling - do not modify)
// =============================================================================

export const __APPLET_METADATA__ = {
  version: "1.0.0",
  generated: "${new Date().toISOString()}",
  framework: "${framework}",
  applets: {
${selectedApplets.map(applet => {
  return `    "${applet.packageName}": {
      name: "${applet.metadata.name}",
      description: "${applet.metadata.description}",
      icon: "${applet.metadata.icon}",
      path: "${applet.metadata.path}",
      permissions: [${applet.metadata.permissions.map((p: string) => `"${p}"`).join(', ')}],
    },`;
}).join('\n')}
  },
};
`;
}