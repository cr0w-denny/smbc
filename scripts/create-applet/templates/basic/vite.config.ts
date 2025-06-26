import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore - vite-plugin-dts will be installed when applet is created
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { suppressUseClientWarnings } from '../../../../scripts/vite/suppress-warnings.ts';
import { getSMBCExternals } from '../../../../scripts/vite/externals.ts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    suppressUseClientWarnings()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.es.js',
    },
    rollupOptions: {
      external: getSMBCExternals('mui', [
        '@smbc/mui-components',
        '@smbc/mui-applet-core',
      ]),
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@tanstack/react-query'
    ]
  }
});