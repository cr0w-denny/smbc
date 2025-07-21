#!/usr/bin/env node

/**
 * List available applets script for @smbc/applet-host
 * 
 * This script shows all available applets that can be installed,
 * along with their current installation status.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { getInstalledApplets } from './applet-discovery.js';

console.log('🔍 SMBC Applets\n');

// Get installed applets (those actually installed via npm)
const installedApplets = getInstalledApplets();
const installedPackageNames = installedApplets.map(applet => applet.packageName);

console.log(`📦 Installed applets: ${installedPackageNames.length}\n`);

// Check current working directory for applet.config.ts
const configPath = resolve(process.cwd(), 'src/applet.config.ts');
const hasConfig = existsSync(configPath);

if (hasConfig) {
  console.log('📁 Found applet.config.ts');
} else {
  console.log('⚠️  No applet.config.ts found');
}
console.log('');

// Display installed applets
if (installedPackageNames.length > 0) {
  console.log('✅ Installed applets:\n');
  
  installedApplets.forEach(applet => {
    console.log(`✅ ${applet.metadata.name}`);
    console.log(`   Package: ${applet.packageName}`);
    console.log(`   Description: ${applet.metadata.description}`);
    console.log(`   Path: ${applet.metadata.path}`);
    if (applet.metadata.permissions && applet.metadata.permissions.length > 0) {
      console.log(`   Permissions: ${applet.metadata.permissions.join(', ')}`);
    }
    console.log('');
  });
} else {
  console.log('💡 No applets currently installed\n');
}

// Show usage instructions
console.log('📖 Usage:');
console.log('');
console.log('To install new applets:');
console.log('  npm install @smbc/<applet-name>-mui');
console.log('');
console.log('To configure applets:');
console.log('  npx applet-postinstall');
console.log('');