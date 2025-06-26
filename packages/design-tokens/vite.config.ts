import { defineConfig } from 'vite';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { dts } from 'vite-plugin-dts-build';

export default defineConfig({
  plugins: [
    dts({
      mode: 'build',
      tsconfigPath: './tsconfig.json',
      cacheDir: './.tsBuildCache-design-tokens'
    }),
    // Custom plugin to preserve Style Dictionary outputs
    {
      name: 'preserve-style-dictionary',
      writeBundle() {
        // Ensure CSS directory exists
        if (!existsSync('dist/css')) {
          mkdirSync('dist/css', { recursive: true });
        }
        // Copy CSS files if they exist
        if (existsSync('dist/css/tokens.css')) {
          // CSS files are already there from Style Dictionary
          console.log('✓ CSS files preserved');
        }
      }
    }
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SMBCDesignTokens',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es.js' : 'js'}`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    copyPublicDir: false,
    emptyOutDir: false, // Don't empty the dist folder to preserve Style Dictionary outputs
  },
});