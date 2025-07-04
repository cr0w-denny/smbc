import { defineConfig } from 'vite';
import { createAppletConfig } from '@smbc/vite-config';

export default defineConfig(
  createAppletConfig({
    appletName: 'hello-applet',
    rootDir: __dirname,
    // Using defaults for most options
    // This applet doesn't need any special configuration
  })
);