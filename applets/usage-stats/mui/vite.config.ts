import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "UsageStatsMUI",
      fileName: "index",
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "@smbc/applet-core",
        "@smbc/mui-applet-core",
        "@smbc/mui-components",
        "@smbc/usage-stats-api",
        "openapi-fetch",
        "zod"
      ]
    }
  }
});