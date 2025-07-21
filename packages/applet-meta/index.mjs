/**
 * SMBC applet metadata
 *
 * This module provides centralized access to core dependency versions
 * and package lists for the SMBC monorepo.
 */

// Core dependency versions that should be consistent across all packages
export const CORE_DEPS = {
  react: "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18.3.23",
  "@types/react-dom": "^18.3.7",
  typescript: "~5.8.3",
  vite: "^7.0.4",
  "@vitejs/plugin-react": "^4.6.0",
  "@mui/material": "^7.2.0",
  "@mui/icons-material": "^7.2.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@tanstack/react-query": "^5.0.0",
  eslint: "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  msw: "^2.2.0",
};

// List of all SMBC packages in the monorepo
export const SMBC_PACKAGES = [
  "@smbc/applet-core",
  "@smbc/applet-meta",
  "@smbc/applet-host",
  "@smbc/mui-applet-core",
  "@smbc/mui-components",
  "@smbc/dataview",
  "@smbc/dataview-mui",
  "@smbc/dataview-ag-grid",
  "@smbc/openapi-msw",
  "@smbc/vite-config",
  "@smbc/hello-mui",
  "@smbc/user-management-mui",
  "@smbc/product-catalog-mui",
  "@smbc/usage-stats-mui",
];

// Core peer dependencies for applet components
export const CORE_PEER_DEPS = {
  react: CORE_DEPS.react,
  "react-dom": CORE_DEPS["react-dom"],
  "@mui/material": CORE_DEPS["@mui/material"],
  "@mui/icons-material": CORE_DEPS["@mui/icons-material"],
};
