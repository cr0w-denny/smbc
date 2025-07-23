#!/usr/bin/env node

/**
 * Cross-platform registry setup script
 * Works on Windows, macOS, and Linux
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const REGISTRY_URL = 'http://localhost:4873';
const CONFIG_FILE = resolve(__dirname, 'config.yaml');
const STORAGE_DIR = resolve(__dirname, 'storage');
const HTPASSWD_FILE = resolve(__dirname, 'htpasswd');

async function waitForRegistry(maxAttempts = 30) {
  console.log('⏳ Waiting for registry to be ready...');
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Use node's built-in fetch (Node 18+) or http module for cross-platform HTTP check
      const response = await fetch(REGISTRY_URL);
      if (response.ok) {
        console.log('✅ Registry is ready!');
        return true;
      }
    } catch (error) {
      // Registry not ready yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('❌ Registry didn\'t start within expected time');
}

async function configureNpm() {
  console.log('🔧 Configuring npm for local registry...');
  try {
    await execAsync(`npm config set @smbc:registry ${REGISTRY_URL}`);
    console.log('✅ npm configured for @smbc packages');
  } catch (error) {
    console.error('❌ Failed to configure npm:', error.message);
    throw error;
  }
}

async function authenticateUser() {
  console.log('🔑 Setting up authentication...');
  
  // Create a simple auth token approach instead of using expect
  try {
    // Try to get current user info
    await execAsync(`npm whoami --registry ${REGISTRY_URL}`);
    console.log('✅ Already authenticated');
    return;
  } catch (error) {
    // Not authenticated, need to set up
    console.log('📝 Authentication required');
    console.log('');
    console.log('Please run the following command manually:');
    console.log(`npm adduser --registry ${REGISTRY_URL}`);
    console.log('Use credentials: dev/dev/dev@example.com');
    console.log('');
    console.log('After authentication, run: npm run registry:publish');
    return false;
  }
}

async function publishPackages() {
  console.log('📦 Building and publishing packages...');
  try {
    await execAsync('npm run registry:publish', { cwd: resolve(__dirname, '../..') });
    console.log('✅ Packages published successfully');
  } catch (error) {
    console.error('❌ Failed to publish packages:', error.message);
    throw error;
  }
}

async function setupRegistry(reset = false) {
  console.log('🚀 Setting up Verdaccio local registry...');
  
  if (reset) {
    console.log('🧹 Resetting registry storage...');
    if (existsSync(STORAGE_DIR)) rmSync(STORAGE_DIR, { recursive: true });
    if (existsSync(HTPASSWD_FILE)) rmSync(HTPASSWD_FILE);
    if (existsSync(resolve(__dirname, '.verdaccio-db.json'))) {
      rmSync(resolve(__dirname, '.verdaccio-db.json'));
    }
    console.log('✅ Registry storage cleared');
  }
  
  // Create storage directory
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('📁 Created storage directory');
  }
  
  // Create empty htpasswd file
  if (!existsSync(HTPASSWD_FILE)) {
    writeFileSync(HTPASSWD_FILE, '');
    console.log('📝 Created empty htpasswd file');
  }
  
  // Start Verdaccio
  console.log('🌐 Starting Verdaccio...');
  console.log(`Registry will be available at: ${REGISTRY_URL}`);
  console.log(`Web interface at: ${REGISTRY_URL}/-/web/detail/@smbc`);
  console.log('');
  
  const verdaccio = spawn('npx', ['verdaccio', '--config', CONFIG_FILE], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  if (reset) {
    // Run post-setup automation in the background
    setTimeout(async () => {
      try {
        await waitForRegistry();
        await configureNpm();
        
        const authenticated = await authenticateUser();
        if (authenticated !== false) {
          await publishPackages();
          console.log('');
          console.log('🎉 Registry setup completed!');
          console.log(`🌐 Registry ready at: ${REGISTRY_URL}`);
          console.log(`📊 Web interface: ${REGISTRY_URL}/-/web/detail/@smbc`);
        }
      } catch (error) {
        console.error('❌ Post-setup automation failed:', error.message);
        console.log('');
        console.log('Manual steps required:');
        console.log(`1. Configure npm: npm config set @smbc:registry ${REGISTRY_URL}`);
        console.log(`2. Authenticate: npm adduser --registry ${REGISTRY_URL}`);
        console.log('3. Publish packages: npm run registry:publish');
      }
    }, 2000);
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down registry...');
    verdaccio.kill();
    process.exit(0);
  });
  
  return new Promise((resolve, reject) => {
    verdaccio.on('error', reject);
    verdaccio.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Verdaccio exited with code ${code}`));
    });
  });
}

// CLI handling
const args = process.argv.slice(2);
const reset = args.includes('--reset');

setupRegistry(reset).catch(error => {
  console.error('❌ Registry setup failed:', error.message);
  process.exit(1);
});