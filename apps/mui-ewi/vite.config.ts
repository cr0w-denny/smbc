import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings, createAppConfig } from "@smbc/vite-config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  // App-specific configuration
  const appSpecificConfig = defineConfig({
    plugins: [
      react(), 
      suppressUseClientWarnings(),
    ],
    resolve: {
      alias: {
        // Only use source aliases in development for HMR
        ...(isProduction ? {} : {
          "@smbc/mui-components": path.resolve(__dirname, "../../packages/mui-components/src"),
          "@smbc/applet-core": path.resolve(__dirname, "../../packages/applet-core/src"),
          "@smbc/applet-host": path.resolve(__dirname, "../../packages/applet-host/src"),
          "@smbc/mui-applet-core": path.resolve(__dirname, "../../packages/mui-applet-core/src"),
          "@smbc/ewi-events-mui": path.resolve(__dirname, "../../applets/ewi-events/mui/src"),
          "@smbc/ewi-events-api": path.resolve(__dirname, "../../applets/ewi-events/api/dist/@typespec/openapi3/openapi.json"),
          "@smbc/ewi-event-details-mui": path.resolve(__dirname, "../../applets/ewi-event-details/mui/src"),
          "@smbc/ewi-obligor-mui": path.resolve(__dirname, "../../applets/ewi-obligor/mui/src"),
          "@smbc/usage-stats-mui": path.resolve(__dirname, "../../applets/usage-stats/mui/src"),
          "@smbc/usage-stats-api": path.resolve(__dirname, "../../applets/usage-stats/api/dist/@typespec/openapi3/openapi.json"),
        }),
      },
    },
    server: {
      port: 3001,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    optimizeDeps: {
      exclude: [
        "@smbc/applet-core",
        "@smbc/applet-host", 
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/ewi-events-mui",
        "@smbc/ewi-events-api",
        "@smbc/ewi-event-details-mui",
        "@smbc/ewi-obligor-mui",
        "@smbc/usage-stats-mui",
        "@smbc/usage-stats-api",
      ],
    },
  });

  // Use shared config with EWI-specific packages
  const finalConfig = mergeConfig(createAppConfig({
    enableCoreAliases: !isProduction, // Only enable source aliases in development for HMR
    additionalVendorPackages: [
      "ag-grid-community",
      "ag-grid-enterprise", 
      "ag-grid-react",
      // Add Tiptap to vendor chunk since it's large
      "@tiptap/core",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-highlight",
      "@tiptap/extension-task-list",
      "@tiptap/extension-task-item",
      "@tiptap/extension-character-count",
    ],
    monorepoPackages: [
      "@smbc/ewi-events-mui",
      "@smbc/ewi-events-api", 
      "@smbc/ewi-event-details-mui",
      "@smbc/ewi-obligor-mui",
      "@smbc/usage-stats-mui",
      "@smbc/usage-stats-api",
    ],
  }), appSpecificConfig);
  
  return finalConfig;
});