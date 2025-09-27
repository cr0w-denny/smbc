import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings, createAppConfig } from "@smbc/vite-config";
import { createDebugPlugin } from "@smbc/mui-applet-devtools/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const entryPoint = isProduction ? "src/main.prod.tsx" : "src/main.dev.tsx";

  // App-specific configuration
  const appSpecificConfig = defineConfig({
    plugins: [
      react(),
      suppressUseClientWarnings(),
      ...createDebugPlugin(), // Only loads in development
    ],
    resolve: {
      alias: {
        // Only use source aliases in development for HMR
        ...(isProduction ? {} : {
          "@smbc/mui-components": path.resolve(__dirname, "../../packages/mui-components/src"),
          "@smbc/applet-core": path.resolve(__dirname, "../../packages/applet-core/src"),
          "@smbc/applet-host": path.resolve(__dirname, "../../packages/applet-host/src"),
          "@smbc/mui-applet-core": path.resolve(__dirname, "../../packages/mui-applet-core/src"),
          "@smbc/mui-applet-devtools": path.resolve(__dirname, "../../packages/mui-applet-devtools/src"),
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
      rollupOptions: {
        input: isProduction ? "index.prod.html" : "index.html",
        plugins: [
          {
            name: 'copy-index-html',
            writeBundle() {
              if (isProduction) {
                // Copy index.prod.html to index.html for preview server
                const fs = require('fs');
                const path = require('path');
                const distDir = path.resolve(__dirname, 'dist');
                const prodHtml = path.join(distDir, 'index.prod.html');
                const indexHtml = path.join(distDir, 'index.html');
                if (fs.existsSync(prodHtml)) {
                  fs.copyFileSync(prodHtml, indexHtml);
                }
              }
            }
          }
        ]
      },
    },
    optimizeDeps: {
      exclude: [
        "@smbc/applet-core",
        "@smbc/applet-host",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/mui-applet-devtools",
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