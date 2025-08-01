import { defineConfig } from 'vite';

export const sharedViteConfig = defineConfig({
  // Remove console logs in production builds
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  // Performance optimizations
  build: {
    // Enable minification for smaller bundles
    minify: 'esbuild',
    // Use consistent chunking strategy
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'query-vendor': ['@tanstack/react-query'],
          'devtools': ['@smbc/mui-applet-devtools'],
          'swagger-ui': ['swagger-ui-react'],
          'msw': ['msw'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@tanstack/react-query',
    ],
    // Force pre-bundling of linked packages
    force: true,
  },
  
  // Enable caching
  cacheDir: 'node_modules/.vite',
  
  // Server optimizations for development
  server: {
    // Enable HMR
    hmr: true,
    // Pre-transform known heavy dependencies
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
      ],
    },
  },
});