import { resolve } from 'path';
import type { UserConfig, Plugin, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { suppressUseClientWarnings } from '../plugins/suppress-warnings.js';
import { getExternals, getSMBCExternals } from '../externals/index.js';

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
      outDir: resolve(rootDir, outDir),
      rollupTypes: false,
      copyDtsFiles: true
    }));
  }

  // Get all external dependencies
  const externals = [
    ...getExternals(externalsPreset, additionalExternals),
    ...getSMBCExternals(additionalSMBCPackages)
  ];


  // Applet-specific configuration
  const appletConfig: UserConfig = {
    plugins: pluginOptions,
    build: {
      lib: {
        entry: resolve(rootDir, entry),
        formats: ['es'],
        fileName: 'index'
      },
      rollupOptions: {
        external: externals,
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

  // Simple merge with user config - avoid complex merging
  if (viteConfig.plugins) {
    appletConfig.plugins = [...(appletConfig.plugins || []), ...(Array.isArray(viteConfig.plugins) ? viteConfig.plugins : [viteConfig.plugins])];
  }
  
  if (viteConfig.build) {
    appletConfig.build = { ...appletConfig.build, ...viteConfig.build };
  }

  // Apply other simple config properties
  Object.keys(viteConfig).forEach(key => {
    if (key !== 'plugins' && key !== 'build') {
      (appletConfig as any)[key] = (viteConfig as any)[key];
    }
  });

  return appletConfig;
}