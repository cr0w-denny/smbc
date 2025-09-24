import { defineConfig } from "vite";
import { createAppletConfig } from "@smbc/vite-config";

export default defineConfig(
  createAppletConfig({
    appletName: "mui-applet-devtools",
    rootDir: __dirname,
  }),
);
