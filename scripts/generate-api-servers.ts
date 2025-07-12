#!/usr/bin/env tsx
/**
 * Build-time script to extract server configurations from all OpenAPI specs
 * and generate a clean TypeScript config file
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface OpenAPIServer {
  url: string;
  description?: string;
}

interface OpenAPISpec {
  servers?: OpenAPIServer[];
}

interface ServerConfig {
  production?: string;
  development?: string;
  mock?: string;
}

interface GeneratedConfig {
  [appletId: string]: ServerConfig;
}

async function generateApiServersConfig() {
  console.log('🔍 Scanning for OpenAPI specs...');
  
  // Find all OpenAPI specs in applet directories
  const specPaths = await glob('applets/*/api/tsp-output/@typespec/openapi3/openapi.json', {
    cwd: process.cwd()
  });
  
  console.log(`📁 Found ${specPaths.length} OpenAPI specs`);
  
  const config: GeneratedConfig = {};
  
  for (const specPath of specPaths) {
    // Extract applet ID from path (e.g., "applets/user-management/api/..." -> "user-management")
    const appletId = specPath.split('/')[1];
    
    try {
      const specContent = fs.readFileSync(specPath, 'utf-8');
      const spec: OpenAPISpec = JSON.parse(specContent);
      
      if (!spec.servers || spec.servers.length === 0) {
        console.warn(`⚠️  No servers found in ${appletId} spec`);
        continue;
      }
      
      const serverConfig: ServerConfig = {};
      
      // Extract servers by description
      for (const server of spec.servers) {
        const desc = server.description?.toLowerCase() || '';
        
        if (desc.includes('production') || desc.includes('prod')) {
          serverConfig.production = server.url;
        } else if (desc.includes('development') || desc.includes('dev')) {
          serverConfig.development = server.url;
        } else if (desc.includes('mock') || desc.includes('test')) {
          serverConfig.mock = server.url;
        }
      }
      
      config[appletId] = serverConfig;
      console.log(`✅ Extracted servers for ${appletId}:`, serverConfig);
      
    } catch (error) {
      console.error(`❌ Failed to process ${specPath}:`, error);
    }
  }
  
  // Generate TypeScript config file
  const outputPath = path.join(process.cwd(), 'apps/mui-host-dev/src/generated/api-servers.ts');
  const outputDir = path.dirname(outputPath);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const generatedContent = `/**
 * Auto-generated API server configurations
 * 
 * This file is generated from OpenAPI specs in applet directories.
 * Do not edit manually - run 'npm run generate:api-servers' to regenerate.
 * 
 * Generated on: ${new Date().toISOString()}
 */

export interface ServerConfig {
  production?: string;
  development?: string;
  mock?: string;
}

export const API_SERVERS: Record<string, ServerConfig> = ${JSON.stringify(config, null, 2)} as const;

export type AppletId = keyof typeof API_SERVERS;

/**
 * Get server URL for an applet based on environment
 */
export function getServerUrl(
  appletId: AppletId,
  environment: 'production' | 'development' | 'mock' = 'development'
): string {
  const config = API_SERVERS[appletId];
  
  if (!config) {
    throw new Error(\`No server configuration found for applet: \${appletId}\`);
  }
  
  const url = config[environment];
  
  if (!url) {
    // Fallback order: development -> production -> first available
    const fallback = config.development || config.production || Object.values(config)[0];
    if (!fallback) {
      throw new Error(\`No server URL found for applet \${appletId} in any environment\`);
    }
    console.warn(\`No \${environment} server for \${appletId}, using fallback: \${fallback}\`);
    return fallback;
  }
  
  return url;
}

/**
 * Get server URL for a specific environment
 */
export function getApiUrl(
  appletId: AppletId,
  environment: 'production' | 'development' | 'mock' = 'development'
): string {
  return getServerUrl(appletId, environment);
}
`;
  
  fs.writeFileSync(outputPath, generatedContent);
  console.log(`🎉 Generated API servers config: ${outputPath}`);
  console.log(`📊 Total applets configured: ${Object.keys(config).length}`);
}

// Run the script
generateApiServersConfig().catch(console.error);