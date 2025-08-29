import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings, injectAppletVersions, createAppConfig } from "@smbc/vite-config";
import { visualizer } from "rollup-plugin-visualizer";

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
    // Set base path for deployment
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
        // Only use source aliases in development for HMR
        // In production, use built packages to avoid bundling all source code
        ...(isProduction ? {} : {
          "@smbc/mui-components": path.resolve(__dirname, "../../packages/mui-components/src"),
          "@smbc/applet-core": path.resolve(__dirname, "../../packages/applet-core/src"),
          "@smbc/applet-host": path.resolve(__dirname, "../../packages/applet-host/src"),
          "@smbc/mui-applet-core": path.resolve(__dirname, "../../packages/mui-applet-core/src"),
          "@smbc/applet-meta": path.resolve(__dirname, "../../packages/applet-meta"),
        }),
      },
    },
    plugins: [
      react(), 
      suppressUseClientWarnings(),
      // Add bundle analyzer
      ...(isProduction ? [visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })] : [])
    ],
    server: {
      port: 3001,
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
      },
    },
    optimizeDeps: {
      // Exclude local SMBC packages from optimization to enable HMR
      exclude: [
        // Core packages
        "@smbc/applet-core",
        "@smbc/applet-host",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/applet-meta",
        
        // EWI-specific packages
        "@smbc/ewi-events-mui",
        "@smbc/ewi-events-api",
        
        // Other packages
        "@smbc/openapi-msw",
        "@smbc/typespec-core",
      ],
    },
  });

  // Use optimized chunking strategy from shared config
  const finalConfig = mergeConfig(createAppConfig({ chunkingStrategy: 'optimized' }), appSpecificConfig);
  
  // Ensure esbuild configuration is properly applied
  if (isProduction) {
    finalConfig.esbuild = {
      drop: ['console', 'debugger']
    };
  }
  
  return finalConfig;
});