#!/usr/bin/env node

/**
 * List available applets script for @smbc/applet-host
 * 
 * This script shows all available applets that can be installed,
 * along with their current installation status.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { getAppletMetadata } from '@smbc/applet-meta';

console.log('🔍 SMBC Applets\n');

// Get installed applets (those actually installed via npm)
const installedApplets = getAppletMetadata();
const installedPackageNames = Object.keys(installedApplets);

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
  
  Object.entries(installedApplets).forEach(([packageName, applet]: [string, any]) => {
    console.log(`✅ ${applet.name}`);
    console.log(`   Package: ${packageName}`);
    console.log(`   Description: ${applet.description}`);
    console.log(`   Path: ${applet.path}`);
    if (applet.permissions && applet.permissions.length > 0) {
      console.log(`   Permissions: ${applet.permissions.join(', ')}`);
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