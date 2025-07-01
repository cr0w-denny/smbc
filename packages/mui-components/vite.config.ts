import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*", "src/**/*.stories.*"],
      rollupTypes: true,
      bundledPackages: ["@smbc/design-tokens", "@smbc/mui-applet-core"],
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
      external: [
        "react",
        "react-dom",
        "@mui/material",
        "@smbc/design-tokens",
        "@smbc/mui-applet-core",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
