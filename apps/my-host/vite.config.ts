import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { suppressUseClientWarnings } from "../../scripts/vite/suppress-warnings.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  // Load environment config based on mode
  const envConfig =
    mode === "hash"
      ? {
          envDir: ".",
          envPrefix: "VITE_",
          define: {},
        }
      : {};

  // Add production-specific defines
  const productionDefines = isProduction
    ? {
        // Allow disabling MSW via environment variable
        "import.meta.env.VITE_DISABLE_MSW": process.env.VITE_DISABLE_MSW
          ? `"${process.env.VITE_DISABLE_MSW}"`
          : '"false"',
      }
    : {};

  return {
    ...envConfig,
    define: {
      ...envConfig.define,
      ...productionDefines,
      // Define environment flags for conditional imports
      __DEV__: !isProduction,
    },
    plugins: [react(), suppressUseClientWarnings()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: !isProduction,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress sourcemap warnings from node_modules
          if (warning.code === "SOURCEMAP_ERROR") return;
          warn(warning);
        },
        output: {
          manualChunks: (id) => {
            // Vendor libraries that rarely change
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom")
            ) {
              return "react-vendor";
            }
            if (
              id.includes("node_modules/@mui") ||
              id.includes("node_modules/@emotion")
            ) {
              return "mui-vendor";
            }
            if (id.includes("node_modules/@tanstack")) {
              return "tanstack-vendor";
            }
            if (id.includes("node_modules/msw")) {
              return "msw-vendor";
            }

            // SMBC shared libraries - change more frequently
            if (
              id.includes("@smbc/ui-core") ||
              id.includes("@smbc/applet-core") ||
              id.includes("@smbc/mui-applet-core") ||
              id.includes("@smbc/mui-components") ||
              id.includes("@smbc/react-query-dataview") ||
              id.includes("@smbc/applet-devtools")
            ) {
              return "smbc-shared";
            }

            // Other vendor dependencies
            if (id.includes("node_modules")) {
              return "vendor-misc";
            }
          },
        },
      },
    },
    optimizeDeps: {
      // Pre-bundle these dependencies to avoid issues and improve dev server startup
      include: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
      ],
    },
  };
});