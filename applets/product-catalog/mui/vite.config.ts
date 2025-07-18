import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { suppressUseClientWarnings } from "../../../scripts/vite/suppress-warnings.ts";
import { getSMBCExternals } from "../../../scripts/vite/externals.ts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
      exclude: ["**/*.stories.*", "**/*.test.*"],
    }),
    suppressUseClientWarnings(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.es.js",
    },
    rollupOptions: {
      external: getSMBCExternals("full", [
        "@smbc/applet-core",
        "@smbc/ui-core",
        "@smbc/mui-components",
        "@smbc/mui-applet-core",
        "@smbc/applet-query-client",
        "@smbc/product-catalog-api",
        "@smbc/product-catalog-client",
      ]),
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to avoid issues
    include: ["@mui/material"],
  },
});
