/**
 * SMBC applet metadata
 * 
 * This module provides centralized access to core dependency versions
 * and package lists for the SMBC monorepo.
 */

// Core dependency versions that should be consistent across all packages
export const CORE_DEPS = {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.0", 
  "@types/react-dom": "^18.2.0",
  "typescript": "^5.3.3",
  "vite": "^5.1.3",
  "@vitejs/plugin-react": "^4.2.1",
  "@mui/material": "^5.15.10",
  "@mui/icons-material": "^5.15.10",
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "@tanstack/react-query": "^5.0.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  "msw": "^2.2.0"
};

// List of all SMBC packages in the monorepo
export const SMBC_PACKAGES = [
  "@smbc/applet-core",
  "@smbc/applet-meta",
  "@smbc/applet-host",
  "@smbc/mui-applet-core",
  "@smbc/mui-components",
  "@smbc/react-query-dataview",
  "@smbc/vite-config",
  "@smbc/hello-mui",
  "@smbc/user-management-mui",
  "@smbc/product-catalog-mui",
  "@smbc/usage-stats-mui"
];

// Core peer dependencies for applet components
export const CORE_PEER_DEPS = {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@mui/material": "^5.0.0",
  "@mui/icons-material": "^5.0.0"
};