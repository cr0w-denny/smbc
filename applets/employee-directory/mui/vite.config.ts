import { defineConfig } from "vite";
import { createAppletConfig } from "@smbc/vite-config";

export default defineConfig(
  createAppletConfig({
    appletName: "employee-directory-mui",
    rootDir: __dirname,
  }),
);