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
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@smbc/mui-components": path.resolve(
        __dirname,
        "../../mui-components/src",
      ),
      "@smbc/applet-core": path.resolve(__dirname, "../../applet-core/src"),
      "@smbc/mui-applet-core": path.resolve(
        __dirname,
        "../../mui-applet-core/src",
      ),
      "@smbc/mui-applet-devtools": path.resolve(
        __dirname,
        "../../mui-applet-devtools/src",
      ),
      "@smbc/dataview": path.resolve(__dirname, "../../dataview/src"),
      "@smbc/ui-core": path.resolve(__dirname, "../../ui-core/src"),
    };

    return config;
  },
};

export default config;
