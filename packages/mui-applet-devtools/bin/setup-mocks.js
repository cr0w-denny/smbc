#!/usr/bin/env node

import { setupMockServiceWorker } from '@smbc/applet-devtools/scripts/setup-msw.js';

console.log('🎭 Setting up MSW and mock overrides...');

// Force the script to use current working directory as the host app
process.env.FORCE_HOST_DIR = process.cwd();

try {
  setupMockServiceWorker('@smbc/mui-applet-devtools');
  console.log('✅ Mock setup complete!');
  console.log('\n📁 Created:');
  console.log('  • public/mockServiceWorker.js');
  console.log('  • src/mocks/ directory with per-applet templates');
  console.log('\n📖 See src/mocks/README.md for usage instructions');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}