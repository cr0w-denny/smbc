import { createAppletConfig } from '@smbc/vite-config/applet';
import { resolve } from 'path';

export default createAppletConfig({
  appletName: 'ewi-event-details',
  rootDir: resolve(import.meta.dirname),
  entry: 'src/index.ts',
  outDir: 'dist'
});