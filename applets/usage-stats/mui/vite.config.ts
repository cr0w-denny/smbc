import { defineConfig } from "vite";
import { suppressUseClientWarnings } from "../../../scripts/vite/suppress-warnings";

export default defineConfig({
  plugins: [suppressUseClientWarnings()],
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
        "openapi-fetch"
      ]
    }
  }
});