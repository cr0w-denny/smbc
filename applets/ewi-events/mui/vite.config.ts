import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'EventsApplet',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        // React core
        'react', 
        'react-dom',
        'react/jsx-runtime',
        
        // MUI - externalize everything
        /^@mui\/.*/,
        
        // Emotion (MUI dependency)
        /^@emotion\/.*/,
        
        // AG Grid - HUGE, must externalize
        /^ag-grid-.*/,
        
        // Date libraries
        /^date-fns.*/,
        '@date-io/date-fns',
        
        // Internal packages
        /^@smbc\/.*/,
        
        // React Query
        '@tanstack/react-query',
        
        // Any other large libraries
        'axios',
        'lodash',
        /^lodash\/.*/,
      ],
    },
  },
});