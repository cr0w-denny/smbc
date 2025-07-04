import { resolve } from 'path';
import type { UserConfig, Plugin, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { suppressUseClientWarnings } from '../plugins/suppress-warnings';
import { getExternals, getSMBCExternals } from '../externals';
import { createBaseConfig } from './base';

export interface AppletConfigOptions {
  // Required
  appletName: string;
  rootDir: string;
  
  // Optional paths
  entry?: string; // defaults to src/index.ts
  outDir?: string; // defaults to dist
  
  // Features
  typescript?: boolean; // Enable TypeScript declarations (default: true)
  suppressWarnings?: boolean; // Suppress 'use client' warnings (default: true)
  
  // Dependencies
  externalsPreset?: 'core' | 'mui' | 'api' | 'full'; // defaults to 'full'
  additionalExternals?: string[]; // Additional packages to externalize
  additionalSMBCPackages?: string[]; // Additional SMBC packages
  optimizeDeps?: string[]; // Dependencies to pre-bundle
  
  // Advanced
  plugins?: Plugin[]; // Additional Vite plugins
  viteConfig?: UserConfig; // Additional Vite config to merge
}

/**
 * Creates a complete Vite configuration for SMBC applets
 */
export function createAppletConfig(options: AppletConfigOptions): UserConfig {
  const {
    appletName: _appletName, // Currently unused but may be needed for future features
    rootDir,
    entry = 'src/index.ts',
    outDir = 'dist',
    typescript = true,
    suppressWarnings = true,
    externalsPreset = 'full',
    additionalExternals = [],
    additionalSMBCPackages = [],
    optimizeDeps = [],
    plugins = [],
    viteConfig = {}
  } = options;

  // Build plugins array - use PluginOption type which can be Plugin | Plugin[] | null | undefined
  const pluginOptions: PluginOption[] = [
    react(),
    ...plugins
  ];

  if (suppressWarnings) {
    pluginOptions.push(suppressUseClientWarnings());
  }

  if (typescript) {
    pluginOptions.push(dts({
      insertTypesEntry: true,
      include: ['src'],
      outDir: resolve(rootDir, outDir, 'types'),
      rollupTypes: true
    }));
  }

  // Get all external dependencies
  const externals = [
    ...getExternals(externalsPreset, additionalExternals),
    ...getSMBCExternals(additionalSMBCPackages)
  ];

  // Base configuration
  const baseConfig = createBaseConfig(rootDir);

  // Applet-specific configuration
  const appletConfig: UserConfig = {
    plugins: pluginOptions,
    build: {
      ...baseConfig.build,
      lib: {
        entry: resolve(rootDir, entry),
        formats: ['es'],
        fileName: () => 'index.es.js'
      },
      rollupOptions: {
        external: externals,
        output: {
          preserveModules: false,
          exports: 'named'
        }
      },
      outDir: resolve(rootDir, outDir)
    }
  };

  // Add optimization config if needed
  if (optimizeDeps.length > 0) {
    appletConfig.optimizeDeps = {
      include: optimizeDeps
    };
  }

  // Merge all configurations
  return mergeConfigs(baseConfig, appletConfig, viteConfig);
}

/**
 * Deep merge multiple Vite configurations
 */
function mergeConfigs(...configs: UserConfig[]): UserConfig {
  const result: UserConfig = {};
  
  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (Array.isArray(value) && Array.isArray(result[key as keyof UserConfig])) {
        // Merge arrays
        (result as any)[key] = [...(result as any)[key], ...value];
      } else if (typeof value === 'object' && value !== null && typeof result[key as keyof UserConfig] === 'object') {
        // Merge objects recursively
        (result as any)[key] = mergeConfigs(result[key as keyof UserConfig] as any, value);
      } else {
        // Override value
        (result as any)[key] = value;
      }
    }
  }
  
  return result;
}