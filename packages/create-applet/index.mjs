#!/usr/bin/env node
import { createApplet } from './create-applet.js';

const args = process.argv.slice(2);
const name = args[0];

if (!name) {
  console.error('Usage: npx @smbc/create-applet <name> [options]');
  console.error('');
  console.error('Example:');
  console.error('  npx @smbc/create-applet "My Custom Applet"');
  console.error('  npx @smbc/create-applet my-applet --dir custom-directory');
  console.error('');
  console.error('Options:');
  console.error('  --dir <directory>    Directory name (default: kebab-case of name)');
  process.exit(1);
}

const dirIndex = args.indexOf('--dir');
const directory = dirIndex !== -1 ? args[dirIndex + 1] : undefined;

try {
  await createApplet({ name, directory });
} catch (error) {
  console.error('❌ Error creating applet:', error instanceof Error ? error.message : error);
  process.exit(1);
}