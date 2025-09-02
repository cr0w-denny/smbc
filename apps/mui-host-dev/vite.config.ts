import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import { suppressUseClientWarnings, createAppConfig } from "@smbc/vite-config";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // App-specific configuration
  const appSpecificConfig = defineConfig({
    plugins: [react(), suppressUseClientWarnings()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      // Force everything into one bundle for demo app
      rollupOptions: {
        output: {
          manualChunks: () => 'index'
        },
      },
      sourcemap: false,
    },
    optimizeDeps: {
      // Force include these packages for proper bundling
      include: ["reselect", "swagger-ui-react"],
    },
  });

  // Use shared config with devtools and additional monorepo packages
  const finalConfig = mergeConfig(createAppConfig({ 
    includeDevtools: true,
    disableChunking: true, // Let app-specific config handle chunking
    enableCoreAliases: true, // Enable HMR for SMBC core packages
    monorepoPackages: [
      // Devtools and dataview
      "@smbc/mui-applet-devtools",
      "@smbc/dataview",
      "@smbc/applet-devtools",
      
      // Applet packages
      "@smbc/hello-mui",
      "@smbc/user-management-mui",
      "@smbc/product-catalog-mui",
      "@smbc/employee-directory-mui",
      "@smbc/usage-stats-mui",
      "@smbc/filter-test-mui",
      
      // API packages  
      "@smbc/user-management-api",
      "@smbc/product-catalog-api",
      "@smbc/employee-directory-api",
      "@smbc/usage-stats-api",
    ],
  }), appSpecificConfig);
  
  return finalConfig;
});
