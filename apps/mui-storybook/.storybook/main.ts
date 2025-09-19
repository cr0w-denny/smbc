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

    return config;
  },
};

export default config;
