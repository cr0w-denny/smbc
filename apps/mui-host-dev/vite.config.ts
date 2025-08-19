import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings, injectAppletVersions } from "@smbc/vite-config";
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
    // Remove console logs in production builds
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    },
    define: {
      ...envConfig.define,
      ...productionDefines,
      ...injectAppletVersions(),
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
        "@smbc/applet-host": path.resolve(__dirname, "../../packages/applet-host/src"),
        "@smbc/mui-applet-core": path.resolve(__dirname, "../../packages/mui-applet-core/src"),
        "@smbc/mui-applet-devtools": path.resolve(__dirname, "../../packages/mui-applet-devtools/src"),
        "@smbc/dataview": path.resolve(__dirname, "../../packages/dataview/src"),
        "@smbc/applet-meta": path.resolve(__dirname, "../../packages/applet-meta"),
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
        output: {
          manualChunks: (id) => {
            // Force swagger-ui-react and reselect into main bundle to avoid module resolution issues
            if (id.includes('swagger-ui-react') || id.includes('reselect')) {
              return 'index';
            }
            // Default chunking for everything else
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        },
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
      },
    },
    optimizeDeps: {
      // Force include these packages for proper bundling
      include: ["reselect", "swagger-ui-react"],
      // Exclude local SMBC packages from optimization to enable HMR
      exclude: [
        // Core packages
        "@smbc/applet-core",
        "@smbc/applet-host",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/mui-applet-devtools",
        "@smbc/dataview",
        "@smbc/applet-devtools",
        "@smbc/applet-meta",
        
        // Applet packages
        "@smbc/hello-mui",
        "@smbc/user-management-mui",
        "@smbc/product-catalog-mui",
        "@smbc/employee-directory-mui",
        "@smbc/usage-stats-mui",
        "@smbc/filter-test-mui",
        
        // API packages  
        "@smbc/user-management-api",
        "@smbc/product-catalog-api",
        "@smbc/employee-directory-api",
        "@smbc/usage-stats-api",
        
        // Other packages
        "@smbc/openapi-msw",
        "@smbc/typespec-core",
      ],
    },
  });

  const finalConfig = mergeConfig(sharedViteConfig, appSpecificConfig);
  
  // Ensure esbuild configuration is properly applied
  if (isProduction) {
    finalConfig.esbuild = {
      drop: ['console', 'debugger']
    };
  }
  
  return finalConfig;
});
