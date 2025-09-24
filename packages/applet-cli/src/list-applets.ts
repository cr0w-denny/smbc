#!/usr/bin/env node

/**
 * List available applets script for @smbc/applet-host
 * 
 * This script shows all available applets that can be installed,
 * along with their current installation status.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
console.log('🔍 SMBC Applets\n');

// Available SMBC applets
const availableApplets = [
  '@smbc/hello-mui',
  '@smbc/user-management-mui',
  '@smbc/product-catalog-mui',
  '@smbc/employee-directory-mui',
  '@smbc/usage-stats-mui',
  '@smbc/reports-mui',
  '@smbc/filter-demo-mui',
  '@smbc/ewi-obligor-mui',
  '@smbc/ewi-events-mui',
  '@smbc/ewi-event-details-mui'
];

console.log(`📦 Available applets: ${availableApplets.length}\n`);

// Check current working directory for applet.config.ts
const configPath = resolve(process.cwd(), 'src/applet.config.ts');
const hasConfig = existsSync(configPath);

if (hasConfig) {
  console.log('📁 Found applet.config.ts');
} else {
  console.log('⚠️  No applet.config.ts found');
}
console.log('');

// Display available applets
console.log('📦 Available applets:\n');

availableApplets.forEach(pkg => {
  const name = pkg.replace('@smbc/', '').replace('-mui', '');
  const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  console.log(`• ${displayName}`);
  console.log(`   Package: ${pkg}`);
  console.log('');
});

// Show usage instructions
console.log('📖 Usage:');
console.log('');
console.log('To install new applets:');
console.log('  npm install @smbc/<applet-name>-mui');
console.log('');
console.log('To configure applets:');
console.log('  npx applet-postinstall');
console.log('');