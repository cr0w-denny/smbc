import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { suppressUseClientWarnings } from '../../scripts/vite/suppress-warnings.ts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  // Load environment config based on mode
  const envConfig =
    mode === 'hash'
      ? {
          envDir: '.',
          envPrefix: 'VITE_',
          define: {
            'import.meta.env.VITE_USE_HASH_ROUTING': '"true"',
          },
        }
      : {};

  // Add production-specific defines
  const productionDefines = isProduction
    ? {
        'import.meta.env.VITE_DISABLE_MSW': '"true"',
      }
    : {};

  return {
    ...envConfig,
    define: {
      ...envConfig.define,
      ...productionDefines,
    },
    plugins: [react(), suppressUseClientWarnings()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress sourcemap warnings from node_modules
          if (warning.code === 'SOURCEMAP_ERROR') return;
          warn(warning);
        },
        output: {
          manualChunks: (id) => {
            // Vendor libraries that rarely change
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('node_modules/@mui') ||
              id.includes('node_modules/@emotion')
            ) {
              return 'mui-vendor';
            }
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('node_modules/msw')) {
              return 'dev-vendor';
            }
            if (id.includes('node_modules/swagger-ui-react')) {
              return 'swagger-vendor';
            }
            if (id.includes('node_modules/valibot')) {
              return 'util-vendor';
            }

            // SMBC shared libraries - change more frequently
            if (
              id.includes('@smbc/mui-applet-core') ||
              id.includes('@smbc/mui-applet-host') ||
              id.includes('@smbc/shared-query-client') ||
              id.includes('@smbc/mui-components')
            ) {
              return 'smbc-shared';
            }

            // Split each applet into its own chunk
            if (id.includes('@smbc/user-management-mui')) {
              return 'user-management-applet';
            }
            if (id.includes('@smbc/product-catalog-mui')) {
              return 'product-catalog-applet';
            }

            // Any other node_modules
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
          },
        },
      },
    },
    optimizeDeps: {
      // Pre-bundle these dependencies to avoid issues and improve dev server startup
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        '@tanstack/react-query',
        '@tanstack/react-query-devtools',
        'swagger-ui-react',
        'valibot',
      ],
    },
  };
});
