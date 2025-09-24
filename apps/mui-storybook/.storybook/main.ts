import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

function getAbsolutePath(value: string) {
  return path.dirname(require.resolve(path.join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-docs"),
  ],

  staticDirs: ["./public"],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },


  async viteFinal(config) {
    // Add inline suppressUseClientWarnings plugin to fix MUI warnings
    config.plugins = config.plugins || [];
    config.plugins.push({
      name: 'suppress-use-client-warnings',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('node_modules') && (code.startsWith('"use client"') || code.startsWith("'use client'"))) {
          return {
            code: code.replace(/^['"]use client['"];?\s*\n?/, ''),
            map: null
          };
        }
        return null;
      }
    });

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@smbc/mui-components": path.resolve(
        __dirname,
        "../../../packages/mui-components/src",
      ),
      "@smbc/applet-core": path.resolve(__dirname, "../../../packages/applet-core/src"),
      "@smbc/mui-applet-core": path.resolve(
        __dirname,
        "../../../packages/mui-applet-core/src",
      ),
      "@smbc/mui-applet-devtools": path.resolve(
        __dirname,
        "../../../packages/mui-applet-devtools/src",
      ),
      "@smbc/dataview": path.resolve(__dirname, "../../../packages/dataview/src"),
      "@smbc/ui-core": path.resolve(__dirname, "../../../packages/ui-core/src"),
    };

    // Put all vendor dependencies into a single vendor bundle
    config.build = config.build || {};
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    };

    // Optimize dependencies
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
    };

    return config;
  },
};

export default config;
