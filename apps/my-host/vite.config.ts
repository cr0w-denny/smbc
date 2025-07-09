import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    define: {
      global: "globalThis",
    },
    resolve: {
      dedupe: ["react", "react-dom"],
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
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "mui-vendor": [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            "data-vendor": ["@tanstack/react-query"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"], // Force React into optimized deps
      exclude: [
        "@smbc/applet-core",
        "@smbc/mui-applet-core",
        "@smbc/mui-applet-devtools",
        "@smbc/mui-applet-host",
        "@smbc/mui-components",
        "@smbc/react-query-dataview",
        "@smbc/ui-core",
      ],
    },
  };
});
