/**
 * Shared dependency definitions for the SMBC monorepo
 * 
 * This is the single source of truth for all dependency versions.
 * Used by:
 * - Dependency management tool (sync/validate)
 * - DevHostAppBar click-to-copy feature
 * - Any other tooling that needs consistent version info
 */

// Core dependencies that should be synchronized across the monorepo
export const CORE_DEPS: Record<string, string> = {
  // React ecosystem
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",

  // Material-UI
  "@mui/material": "^7.1.2",
  "@mui/icons-material": "^7.1.2",
  "@mui/x-data-grid": "^7.0.0",
  "@mui/x-tree-view": "^8.6.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",

  // State management
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-query-devtools": "^5.0.0",

  // Development tools
  "typescript": "^5.3.3",
  "vite": "^5.1.3",
  "@vitejs/plugin-react": "^4.2.1",
  "vite-plugin-dts": "^4.5.4",
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.2.5",
  "@types/node": "^20.11.17",

  // Testing
  "vitest": "^1.3.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/jest-dom": "^6.4.0",

  // Documentation
  "swagger-ui-react": "^5.25.2",
  "@types/swagger-ui-react": "^5.18.0",

  // API
  "openapi-fetch": "^0.9.0",
  "msw": "^2.2.0",
};

// SMBC packages - npm workspaces handles resolution automatically
export const SMBC_PACKAGES: string[] = [
  "@smbc/applet-core",
  "@smbc/mui-applet-core", 
  "@smbc/mui-components",
  "@smbc/react-query-dataview",
  "@smbc/ui-core",
  "@smbc/vite-config",
  "@smbc/mui-applet-host",
];

// Core peer dependencies required by all applets (for click-to-copy)
export const CORE_PEER_DEPS = {
  "react": CORE_DEPS["react"],
  "react-dom": CORE_DEPS["react-dom"],
  "@mui/material": CORE_DEPS["@mui/material"],
  "@emotion/react": CORE_DEPS["@emotion/react"],
  "@emotion/styled": CORE_DEPS["@emotion/styled"],
  "@tanstack/react-query": CORE_DEPS["@tanstack/react-query"],
  "@smbc/applet-core": "^0.0.1",
  "@smbc/mui-applet-core": "^0.0.1",
  "@smbc/mui-components": "^0.0.1"
};