import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings } from "../../scripts/vite/suppress-warnings.ts";
import { sharedViteConfig } from "../../vite.shared.config.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  // Load environment config
  const envConfig = {
    envDir: ".",
    envPrefix: "VITE_",
    define: {},
  };

  // Add production-specific defines
  const productionDefines = isProduction
    ? {
        // Allow disabling MSW via environment variable (default to false to keep mocks enabled)
        "import.meta.env.VITE_DISABLE_MSW": process.env.VITE_DISABLE_MSW
          ? `"${process.env.VITE_DISABLE_MSW}"`
          : '"false"',
      }
    : {};

  const appSpecificConfig = defineConfig({
    ...envConfig,
    // Set base path for GitHub Pages deployment
    base: process.env.VITE_BASE_PATH || "/",
    define: {
      ...envConfig.define,
      ...productionDefines,
      // Define environment flags for conditional imports
      __DEV__: !isProduction,
      __ENABLE_API_DOCS__:
        !isProduction || process.env.VITE_ENABLE_API_DOCS === "true",
    },
    resolve: {
      alias: {
        // Point to source files for HMR during development
        "@smbc/mui-components": path.resolve(__dirname, "../../packages/mui-components/src"),
        "@smbc/applet-core": path.resolve(__dirname, "../../packages/applet-core/src"),
        "@smbc/mui-applet-core": path.resolve(__dirname, "../../packages/mui-applet-core/src"),
        "@smbc/react-query-dataview": path.resolve(__dirname, "../../packages/react-query-dataview/src"),
        "@smbc/applet-devtools": path.resolve(__dirname, "../../packages/applet-devtools/src"),
        "@smbc/mui-applet-devtools": path.resolve(__dirname, "../../packages/mui-applet-devtools/src"),
        "@smbc/applet-meta": path.resolve(__dirname, "../../packages/applet-meta/src"),
      },
    },
    plugins: [react(), suppressUseClientWarnings()],
    server: {
      port: 3000,
      open: true,
      hmr: {
        overlay: true,
      },
      watch: {
        // Watch workspace packages for changes
        ignored: ['!**/node_modules/@smbc/**'],
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false, // Disable sourcemaps for production to avoid warnings
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress all sourcemap warnings from node_modules
          if (warning.code === "SOURCEMAP_ERROR") return;
          if (warning.message && warning.message.includes("Can't resolve original location of error")) return;
          if (warning.message && warning.message.includes("sourcemap")) return;
          if (warning.message && warning.message.includes("node_modules")) return;
          // Suppress warnings from specific libraries that have sourcemap issues
          if (warning.loc && warning.loc.file && warning.loc.file.includes("node_modules")) return;
          warn(warning);
        },
        output: {
          manualChunks: (id) => {
            // Force devtools into separate chunks for dynamic loading
            if (id.includes("@smbc/applet-devtools") || id.includes("@smbc/mui-applet-devtools")) {
              return "devtools";
            }
            // Let shared config handle the rest
          },
        },
      },
    },
    optimizeDeps: {
      // Exclude local SMBC packages from optimization to enable HMR
      exclude: [
        "@smbc/applet-core",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/react-query-dataview",
        "@smbc/applet-devtools",
        "@smbc/mui-applet-devtools",
        "@smbc/applet-meta",
        // MSW mocks contain TypeScript files
        "@smbc/user-management-client/mocks",
        "@smbc/product-catalog-client/mocks",
      ],
    },
  });

  return mergeConfig(sharedViteConfig, appSpecificConfig);
});
