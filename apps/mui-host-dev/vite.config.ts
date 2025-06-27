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
      __ENABLE_API_DOCS__:
        !isProduction || process.env.VITE_ENABLE_API_DOCS === "true",
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
            if (
              id.includes("node_modules/swagger-ui-react") ||
              id.includes("node_modules/@swagger-api") ||
              id.includes("node_modules/swagger-client") ||
              id.includes("node_modules/@swaggerexpert")
            ) {
              return "swagger-vendor";
            }
            // Break out other potentially large dependencies
            if (
              id.includes("node_modules/openapi") ||
              id.includes("node_modules/@redocly") ||
              id.includes("node_modules/yaml") ||
              id.includes("node_modules/json-schema")
            ) {
              return "openapi-vendor";
            }
            // Development/testing utilities
            if (
              id.includes("node_modules/@faker-js") ||
              id.includes("node_modules/autolinker") ||
              id.includes("node_modules/highlight.js")
            ) {
              return "dev-utils-vendor";
            }

            // SMBC shared libraries - change more frequently
            if (
              id.includes("@smbc/applet-core") ||
              id.includes("@smbc/mui-applet-core") ||
              id.includes("@smbc/mui-applet-host") ||
              id.includes("@smbc/shared-query-client") ||
              id.includes("@smbc/mui-components") ||
              id.includes("@smbc/user-management-mui") ||
              id.includes("@smbc/product-catalog-mui")
            ) {
              return "smbc-shared";
            }

            // Debug: log what's going into vendor-misc
            if (id.includes("node_modules")) {
              if (process.env.VITE_CHUNK_DEBUG) {
                console.log("vendor-misc:", id);
              }
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
        "swagger-ui-react",
      ],
      // Exclude MSW mocks from optimization - they contain TypeScript files
      exclude: [
        "@smbc/user-management-client/mocks",
        "@smbc/product-catalog-client/mocks",
      ],
    },
  };
});
