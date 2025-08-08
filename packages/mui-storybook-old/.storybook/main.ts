import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // Add aliases for local SMBC packages
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@smbc/mui-components': path.resolve(__dirname, '../../mui-components/src'),
      '@smbc/applet-core': path.resolve(__dirname, '../../applet-core/src'),
      '@smbc/mui-applet-core': path.resolve(__dirname, '../../mui-applet-core/src'),
      '@smbc/mui-applet-devtools': path.resolve(__dirname, '../../mui-applet-devtools/src'),
      '@smbc/react-query-dataview': path.resolve(__dirname, '../../react-query-dataview/src'),
    };
    
    return config;
  },
};

export default config;