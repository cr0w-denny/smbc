import { defineConfig } from 'vite';
import { createAppletConfig } from '@smbc/vite-config';

export default defineConfig(
  createAppletConfig({
    appletName: 'user-management',
    rootDir: __dirname,
    
    // This applet uses additional SMBC packages
    additionalSMBCPackages: ['activity-utils'],
    
    // Pre-bundle certain dependencies for better dev performance
    optimizeDeps: [
      '@mui/x-data-grid',
      '@tanstack/react-query'
    ]
  })
);