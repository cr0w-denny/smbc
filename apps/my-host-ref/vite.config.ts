import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    define: {
      global: "globalThis",
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true, // Enable sourcemaps for debugging
      rollupOptions: {
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

            // SMBC shared libraries
            if (
              id.includes("@smbc/ui-core") ||
              id.includes("@smbc/applet-core") ||
              id.includes("@smbc/mui-applet-core") ||
              id.includes("@smbc/mui-components")
            ) {
              return "smbc-shared";
            }

            // Other vendor deps
            if (id.includes("node_modules")) {
              return "vendor-misc";
            }
          },
        },
      },
    },
    optimizeDeps: {
      exclude: [
        "@smbc/applet-core",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/react-query-dataview",
        "@smbc/ui-core",
        "@smbc/mui-applet-host",
        "@smbc/mui-applet-devtools",
      ],
    },
  };
});
