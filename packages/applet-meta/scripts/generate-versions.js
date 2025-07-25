#!/usr/bin/env node

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(__dirname);

// Find monorepo root
let rootDir = packageDir;
for (let i = 0; i < 5; i++) {
  const testPath = join(rootDir, 'package.json');
  try {
    const content = JSON.parse(readFileSync(testPath, 'utf8'));
    if (content.workspaces) {
      break;
    }
  } catch (e) {
    // Continue searching
  }
  rootDir = dirname(rootDir);
}

console.log('📦 Collecting @smbc package versions...');

const versions = {};
const patterns = [
  'packages/*/package.json',
  'applets/*/mui/package.json', 
  'applets/*/api/package.json'
];

for (const pattern of patterns) {
  const files = glob.sync(pattern, { cwd: rootDir });
  
  for (const file of files) {
    try {
      const fullPath = join(rootDir, file);
      const content = JSON.parse(readFileSync(fullPath, 'utf8'));
      
      if (content.name && content.name.startsWith('@smbc/') && content.version) {
        versions[content.name] = `^${content.version}`;
        console.log(`  ${content.name}: ^${content.version}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${file}:`, error.message);
    }
  }
}

// Generate the versions module
const versionsModule = `// Auto-generated at build time - do not edit manually
// Generated on: ${new Date().toISOString()}

export const SMBC_PACKAGE_VERSIONS = ${JSON.stringify(versions, null, 2)};
`;

const outputPath = join(packageDir, 'versions.generated.mjs');
writeFileSync(outputPath, versionsModule);

console.log(`✅ Generated versions file with ${Object.keys(versions).length} packages`);
console.log(`📄 Written to: ${outputPath}`);