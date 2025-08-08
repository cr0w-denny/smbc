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
        'react', 
        'react-dom', 
        '@mui/material', 
        '@emotion/react', 
        '@emotion/styled',
        '@smbc/ewi-events-api',
        '@smbc/applet-core',
        '@smbc/mui-applet-core',
        '@tanstack/react-query'
      ],
    },
  },
});