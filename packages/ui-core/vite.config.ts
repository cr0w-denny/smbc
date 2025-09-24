import { defineConfig } from "vite";
import { resolve } from "path";
import { dts } from "vite-plugin-dts-build";

export default defineConfig({
  // Remove console logs in production builds
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  plugins: [
    dts({
      mode: "build",
      tsconfigPath: "./tsconfig.json",
      cacheDir: "./.tsBuildCache-ui-core",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SMBCDesignTokens",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "es.js" : "js"}`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    copyPublicDir: false,
  },
});
