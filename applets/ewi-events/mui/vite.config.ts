import { defineConfig } from 'vite';
import { createAppletConfig } from '@smbc/vite-config';

export default defineConfig(
  createAppletConfig({
    appletName: 'ewi-events',
    rootDir: __dirname,
    additionalExternals: [
      // Date libraries
      /^date-fns.*/,
      '@date-io/date-fns',
      // Other large libraries
      'axios',
      'lodash',
      /^lodash\/.*/,
    ]
  })
);