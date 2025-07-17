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

// Check if we're in a CI environment or should skip interactive setup
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
const skipSetup = process.env.SKIP_APPLET_SETUP === 'true';

if (isCI || skipSetup) {
  console.log('⏭️  Skipping interactive setup (CI environment or SKIP_APPLET_SETUP=true)');
  process.exit(0);
}

// Check if applet.config.ts already exists
const configPath = resolve(process.cwd(), 'src/applet.config.ts');
const configExists = existsSync(configPath);

if (configExists) {
  console.log('✅ applet.config.ts already exists, skipping setup');
  process.exit(0);
}

// Detect framework from package.json dependencies
function detectFramework() {
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
    console.warn('Could not detect framework:', error.message);
    return 'unknown';
  }
}

// Simple readline interface for prompts
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
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
    const availableApplets = framework !== 'unknown' ? getAppletsByFramework(framework) : {};
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
    
    // Generate config
    const config = generateConfig(framework, selectedApplets, availableApplets);
    
    // Write config file
    writeFileSync(configPath, config);
    
    console.log('');
    console.log('✅ Created applet.config.ts');
    
    // Install selected applets
    if (selectedApplets.length > 0) {
      console.log('');
      console.log('📦 Installing applets...');
      
      const { spawn } = await import('child_process');
      
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
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

function generateMinimalConfig(framework) {
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

function generateConfig(framework, selectedApplets, availableApplets) {
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
    version: ${appletVarName}.version,
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

// =============================================================================
// METADATA (Used by tooling - do not modify)
// =============================================================================

export const __APPLET_METADATA__ = {
  version: "1.0.0",
  generated: "${new Date().toISOString()}",
  framework: "${framework}",
  applets: {
${selectedApplets.map(pkg => {
  const applet = availableApplets[pkg];
  return `    "${pkg}": {
      name: "${applet.name}",
      description: "${applet.description}",
      icon: "${applet.icon}",
      path: "${applet.path}",
      permissions: [${applet.permissions.map(p => `"${p}"`).join(', ')}]
    },`;
}).join('\n')}
  }
};
`;
}

// Run the setup
main().catch(console.error);