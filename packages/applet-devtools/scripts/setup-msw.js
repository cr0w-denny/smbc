#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function setupMockServiceWorker(devtoolsPackage = '@smbc/applet-devtools') {
  try {
    // Use current working directory as the host app directory
    const hostAppDir = process.env.FORCE_HOST_DIR || process.cwd();
    const publicDir = resolve(hostAppDir, 'public');
    
    const mockServiceWorkerPath = resolve(publicDir, 'mockServiceWorker.js');
    
    // Check if mockServiceWorker.js already exists
    if (existsSync(mockServiceWorkerPath)) {
      console.log('✓ MSW service worker already exists at:', mockServiceWorkerPath);
    } else {
      // Create public directory if it doesn't exist
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
        console.log('✓ Created public directory:', publicDir);
      }
      
      // Copy the service worker file from this package
      const sourceServiceWorker = resolve(__dirname, '..', 'assets', 'mockServiceWorker.js');
      
      if (existsSync(sourceServiceWorker)) {
        const content = readFileSync(sourceServiceWorker, 'utf8');
        writeFileSync(mockServiceWorkerPath, content);
        console.log('✓ Installed MSW service worker at:', mockServiceWorkerPath);
      } else {
        console.warn('⚠ MSW service worker template not found, skipping installation');
      }
    }
    
    // Setup mocks directory
    setupMocksDirectory(devtoolsPackage);
    
  } catch (error) {
    console.warn('⚠ Failed to setup MSW service worker:', error.message);
    // Don't fail the installation if this fails
  }
}

function setupMocksDirectory(devtoolsPackage = '@smbc/applet-devtools') {
  try {
    // Use current working directory as the host app directory
    const hostAppDir = process.env.FORCE_HOST_DIR || process.cwd();
    const srcDir = resolve(hostAppDir, 'src');
    
    const mocksDir = resolve(srcDir, 'mocks');
    
    // Check if mocks directory already exists
    if (existsSync(mocksDir)) {
      console.log('✓ Mocks directory already exists at:', mocksDir);
      return;
    }
    
    // Create mocks directory
    mkdirSync(mocksDir, { recursive: true });
    console.log('✓ Created mocks directory:', mocksDir);
    
    // Parse app.config.ts to find applets
    const applets = parseAppletsFromConfig(srcDir);
    
    // Create individual mock files for each applet
    createAppletMockFiles(mocksDir, applets);
    
    // Create main index.ts that imports all applet mocks
    createMainMockIndex(mocksDir, applets);
    
    // Create MSW setup helper
    createMswSetupHelper(mocksDir, devtoolsPackage);
    
    // Create README
    createMockReadme(mocksDir, applets);
    
    console.log('✓ Created mock override templates for', applets.length, 'applets');
    
  } catch (error) {
    console.warn('⚠ Failed to setup mocks directory:', error.message);
    // Don't fail the installation if this fails
  }
}

function parseAppletsFromConfig(srcDir) {
  try {
    const configPath = resolve(srcDir, 'app.config.ts');
    if (!existsSync(configPath)) {
      console.log('No app.config.ts found, creating generic mock templates');
      return [];
    }
    
    const configContent = readFileSync(configPath, 'utf8');
    
    // Extract applet configurations using regex
    const mountAppletsMatch = configContent.match(/mountApplets\s*\(\s*\{([\s\S]*?)\}\s*\)/);
    if (!mountAppletsMatch) {
      return [];
    }
    
    const appletsConfig = mountAppletsMatch[1];
    const appletMatches = [...appletsConfig.matchAll(/"([^"]+)":\s*\{[\s\S]*?applet:\s*(\w+)/g)];
    
    const applets = [];
    for (const match of appletMatches) {
      const [, appletKey, appletVar] = match;
      applets.push({
        key: appletKey,
        name: appletKey.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        variable: appletVar
      });
    }
    
    return applets;
  } catch (error) {
    console.warn('⚠ Failed to parse app.config.ts:', error.message);
    return [];
  }
}

function createAppletMockFiles(mocksDir, applets) {
  applets.forEach(applet => {
    const fileName = `${applet.key}.mocks.ts`;
    const filePath = resolve(mocksDir, fileName);
    
    // Skip if file already exists
    if (existsSync(filePath)) {
      return;
    }
    
    const content = `// Mock overrides for ${applet.name} applet
// Uncomment and modify the examples below to override default ${applet.name} mocks

import { http, HttpResponse } from 'msw';

export const ${applet.key.replace(/-/g, '')}MockOverrides = [
  // Example: Override ${applet.name} API endpoints
  // http.get('/api/${applet.key}/example', () => {
  //   return HttpResponse.json({
  //     message: 'Custom ${applet.name} response',
  //     data: []
  //   });
  // }),
  
  // Example: Override with error response
  // http.get('/api/${applet.key}/error-example', () => {
  //   return HttpResponse.json(
  //     { error: 'Custom error for ${applet.name}' },
  //     { status: 400 }
  //   );
  // }),
  
  // Example: Add delay for slow responses
  // http.post('/api/${applet.key}/slow-operation', async ({ request }) => {
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   const data = await request.json();
  //   return HttpResponse.json({ 
  //     ...data, 
  //     processed: true,
  //     timestamp: new Date().toISOString()
  //   });
  // }),
];
`;
    
    writeFileSync(filePath, content);
  });
}

function createMainMockIndex(mocksDir, applets) {
  const imports = applets.map(applet => 
    `import { ${applet.key.replace(/-/g, '')}MockOverrides } from './${applet.key}.mocks';`
  ).join('\n');
  
  const exports = applets.map(applet => 
    `  ...${applet.key.replace(/-/g, '')}MockOverrides,`
  ).join('\n');
  
  const content = `// Main mock overrides aggregator
// This file automatically imports all applet-specific mock overrides

${imports}

// Aggregate all mock overrides
export const mockOverrides = [
${exports}
  
  // Add any additional global mock overrides here
  // Example: Global error handler
  // http.all('*', ({ request }) => {
  //   console.log('Mock intercepted:', request.method, request.url);
  //   return passthrough();
  // }),
];
`;
  
  writeFileSync(resolve(mocksDir, 'index.ts'), content);
}

function createMockReadme(mocksDir, applets) {
  const appletList = applets.length > 0 
    ? applets.map(applet => `- \`${applet.key}.mocks.ts\` - ${applet.name} specific overrides`).join('\n')
    : '- Individual applet mock files will be created based on your app.config.ts';
    
  const readmeContent = `# Mocks Directory

This directory allows you to override default applet mocks with custom implementations for your host application.

## File Structure

- \`index.ts\` - Main aggregator that exports all mock overrides
${appletList}
- \`README.md\` - This documentation

## Usage

1. Edit individual applet mock files to customize behavior
2. Uncomment and modify the example handlers in each file
3. The main \`index.ts\` automatically imports all applet overrides
4. MSW will use these overrides when mock mode is enabled

## Per-Applet Customization

Each applet has its own mock file where you can:
- Override specific API endpoints
- Add custom response data
- Simulate error conditions
- Add network delays for testing

## Examples

### Override an endpoint in ${applets[0]?.key || 'an applet'}
\`\`\`typescript
http.get('/api/${applets[0]?.key || 'applet'}/users', () => {
  return HttpResponse.json([
    { id: 1, name: 'Custom User', email: 'custom@example.com' }
  ]);
}),
\`\`\`

### Simulate server errors
\`\`\`typescript
http.post('/api/${applets[0]?.key || 'applet'}/action', () => {
  return HttpResponse.json(
    { error: 'Simulated server error' },
    { status: 500 }
  );
}),
\`\`\`

### Add realistic delays
\`\`\`typescript
http.get('/api/${applets[0]?.key || 'applet'}/slow-data', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return HttpResponse.json({ message: 'This took 2 seconds!' });
}),
\`\`\`

## Global Overrides

Add global mock handlers to the main \`index.ts\` file for cross-applet functionality.
`;

  writeFileSync(resolve(mocksDir, 'README.md'), readmeContent);
}

function createMswSetupHelper(mocksDir, devtoolsPackage = '@smbc/applet-devtools') {
  
  const setupContent = `// MSW Setup Helper
// Use this file to easily integrate mock overrides with your application

import { registerHostMockOverrides } from '${devtoolsPackage}';
import { mockOverrides } from './index';

/**
 * Initialize host-specific mock overrides.
 * Call this function during your app initialization when mock mode is enabled.
 * 
 * Example usage in your App.tsx:
 * 
 * import { useFeatureFlag } from '@smbc/applet-core';
 * import { initializeMockOverrides } from './mocks/setup';
 * 
 * function App() {
 *   const mockEnabled = useFeatureFlag('mockData');
 *   
 *   React.useEffect(() => {
 *     if (mockEnabled) {
 *       initializeMockOverrides();
 *     }
 *   }, [mockEnabled]);
 *   
 *   // ... rest of your app
 * }
 */
export function initializeMockOverrides(): void {
  if (typeof window !== 'undefined') {
    registerHostMockOverrides(mockOverrides);
    console.log('🎭 Host mock overrides registered:', mockOverrides.length, 'handlers');
  }
}

/**
 * Alternative: Auto-initialize if mock mode is enabled
 * This version automatically checks for mock mode and initializes overrides
 */
export async function autoInitializeMockOverrides(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      // Try to get feature flag value (assumes applet-core is available)
      const { useFeatureFlag } = await import('@smbc/applet-core');
      const mockEnabled = useFeatureFlag('mockData');
      
      if (mockEnabled) {
        initializeMockOverrides();
      }
    } catch (error) {
      console.warn('Could not auto-detect mock mode, use initializeMockOverrides() manually');
    }
  }
}
`;

  writeFileSync(resolve(mocksDir, 'setup.ts'), setupContent);
}

// Export the setup function for use by framework packages
export { setupMockServiceWorker };