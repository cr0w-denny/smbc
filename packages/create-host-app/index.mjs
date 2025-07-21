#!/usr/bin/env node
import { createHostApp } from './create-host-app.js';

const args = process.argv.slice(2);
const name = args[0];

if (!name) {
  console.error('Usage: npx @smbc/create-host-app <name> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --template <basic|mui-devtools>  Template to use (default: mui-devtools)');
  console.error('  --dir <directory>                Directory name (default: same as name)');
  process.exit(1);
}

const templateIndex = args.indexOf('--template');
const dirIndex = args.indexOf('--dir');

const template = templateIndex !== -1 ? args[templateIndex + 1] : 'mui-devtools';
const directory = dirIndex !== -1 ? args[dirIndex + 1] : name;

try {
  await createHostApp({ name, directory, template });
} catch (error) {
  console.error('❌ Error creating host app:', error instanceof Error ? error.message : error);
  process.exit(1);
}