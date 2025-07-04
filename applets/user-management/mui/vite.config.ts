import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { suppressUseClientWarnings } from "../../../scripts/vite/suppress-warnings.ts";
import { getSMBCExternals } from "../../../scripts/vite/externals.ts";

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
        "@smbc/mui-components",
        "@smbc/mui-applet-core",
        "@smbc/react-dataview",
        "@smbc/applet-query-client",
        "@smbc/user-management-api",
        "@smbc/user-management-client",
      ]),
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to avoid issues
    include: ["@mui/material", "@mui/icons-material", "@tanstack/react-query"],
  },
});
