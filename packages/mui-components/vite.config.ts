import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { getExternals } from "@smbc/vite-config";

export default defineConfig({
  // Remove console logs in production builds
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  plugins: [
    react(),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*"],
      rollupTypes: true,
      bundledPackages: ["@smbc/ui-core", "@smbc/mui-applet-core"],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "SMBCMUIComponents",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: getExternals('full'),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
});
