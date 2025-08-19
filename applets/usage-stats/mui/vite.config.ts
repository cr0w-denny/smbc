import { defineConfig } from "vite";
import { createAppletConfig } from "@smbc/vite-config";

export default defineConfig(createAppletConfig({
  appletName: "usage-stats-mui",
  rootDir: __dirname,
  additionalExternals: ["ag-grid-enterprise"]
}));