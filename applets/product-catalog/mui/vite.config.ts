import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { 
  suppressUseClientWarnings, 
  getSMBCExternals,
  REACT_EXTERNALS,
  MUI_EXTERNALS,
  API_EXTERNALS 
} from "@smbc/vite-config";

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
      external: [
        ...getSMBCExternals([
          "@smbc/applet-query-client",
          "@smbc/product-catalog-api",
          "@smbc/product-catalog-client",
        ]),
        ...REACT_EXTERNALS,
        ...MUI_EXTERNALS,
        ...API_EXTERNALS,
      ],
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to avoid issues
    include: ["@mui/material"],
  },
});
