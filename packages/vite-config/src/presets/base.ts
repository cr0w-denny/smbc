import { resolve } from 'path';
import type { UserConfig } from 'vite';

/**
 * Base configuration shared across all build types
 */
export function createBaseConfig(rootDir: string): UserConfig {
  return {
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src')
      }
    },
    server: {
      port: 3000,
      open: true
    },
    preview: {
      port: 4173
    },
    build: {
      sourcemap: true,
      minify: true,
      target: 'es2020'
    }
  };
}