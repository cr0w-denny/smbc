import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { injectAppletVersions } from "../index.js";

/**
 * Get chunking configuration
 */
function getChunkingConfig(
  additionalVendorPackages: string[],
  includeDevtools: boolean,
) {
  return {
    // Large vendor bundle - stable dependencies
    vendor: [
      "react",
      "react-dom",
      "@mui/material",
      "@emotion/react",
      "@emotion/styled",
      "@tanstack/react-query",
      // Icons are tree-shaken via barrel export so they go in vendor
      "@mui/icons-material",
      // Additional packages (AG Grid, etc.)
      ...additionalVendorPackages,
    ],

    // Dev bundle - only loaded when mocks enabled
    dev: ["msw", "@faker-js/faker"],

    // Only include devtools if explicitly requested
    ...(includeDevtools ? { devtools: ["@smbc/mui-applet-devtools"] } : {}),
  };
}

/**
 * Shared configuration for production apps
 */
export function createAppConfig({
  includeDevtools = false,
  disableChunking = false,
  additionalVendorPackages = [] as string[],
  enableBundleAnalyzer = true,
  monorepoPackages = [] as string[],
} = {}) {
  const isProduction = process.env.NODE_ENV === "production";

  return defineConfig({
    // Environment configuration
    envDir: ".",
    envPrefix: "VITE_",
    
    // Base path for deployment
    base: process.env.VITE_BASE_PATH || "/",
    
    // Global definitions
    define: {
      // Applet version injection
      ...injectAppletVersions(),
      // Common environment flags
      __DEV__: !isProduction,
      __ENABLE_API_DOCS__: !isProduction || process.env.VITE_ENABLE_API_DOCS === "true",
      // MSW control
      "import.meta.env.VITE_DISABLE_MSW": process.env.VITE_DISABLE_MSW
        ? `"${process.env.VITE_DISABLE_MSW}"`
        : '"false"',
    },

    // Development aliases for monorepo HMR
    resolve: {
      alias: isProduction ? {} : {
        // Core packages
        "@smbc/mui-components": path.resolve(process.cwd(), "../../packages/mui-components/src"),
        "@smbc/applet-core": path.resolve(process.cwd(), "../../packages/applet-core/src"),
        "@smbc/applet-host": path.resolve(process.cwd(), "../../packages/applet-host/src"),
        "@smbc/mui-applet-core": path.resolve(process.cwd(), "../../packages/mui-applet-core/src"),
        "@smbc/applet-meta": path.resolve(process.cwd(), "../../packages/applet-meta"),
        // Additional monorepo packages
        ...Object.fromEntries(
          monorepoPackages.map(pkg => [pkg, path.resolve(process.cwd(), `../../packages/${pkg.replace('@smbc/', '')}/src`)])
        ),
      },
    },

    // Remove console logs in production builds
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
    },
    
    build: {
      minify: "esbuild",
      // Use chunking strategy (unless disabled)
      rollupOptions: disableChunking
        ? {}
        : {
            output: {
              // Manual chunking configuration
              manualChunks: getChunkingConfig(
                additionalVendorPackages,
                includeDevtools,
              ),
            },
            // Suppress sourcemap warnings from node_modules
            onwarn(warning, warn) {
              if (warning.code === "SOURCEMAP_ERROR") return;
              if (warning.message && warning.message.includes("Can't resolve original location of error")) return;
              if (warning.message && warning.message.includes("sourcemap")) return;
              if (warning.message && warning.message.includes("node_modules")) return;
              if (warning.loc && warning.loc.file && warning.loc.file.includes("node_modules")) return;
              warn(warning);
            },
          },
      // Enable source maps for debugging
      sourcemap: true,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Bundle analyzer plugin
    plugins: [
      ...(isProduction && enableBundleAnalyzer ? [visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })] : []),
    ],

    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "@tanstack/react-query",
      ],
      // Exclude local SMBC packages from optimization to enable HMR
      exclude: [
        // Core packages
        "@smbc/applet-core",
        "@smbc/applet-host",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/applet-meta",
        "@smbc/openapi-msw",
        "@smbc/typespec-core",
        // Additional monorepo packages
        ...monorepoPackages,
      ],
      // Force pre-bundling of linked packages
      force: true,
    },

    // Enable caching
    cacheDir: "node_modules/.vite",

    // Server optimizations for development
    server: {
      // Enable HMR
      hmr: {
        overlay: true,
      },
      // Watch workspace packages for changes
      watch: {
        ignored: ['!**/node_modules/@smbc/**'],
      },
      // Pre-transform known heavy dependencies
      warmup: {
        clientFiles: ["./src/main.tsx", "./src/App.tsx"],
      },
    },
  });
}
