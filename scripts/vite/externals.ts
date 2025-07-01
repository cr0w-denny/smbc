// =============================================================================
// SMBC Vite Externals Configuration
// =============================================================================

/**
 * Comprehensive list of third-party dependencies that should be externalized
 * across all SMBC packages to avoid duplication and enable proper version
 * management at the host application level.
 */

// High Priority - Core Framework
const REACT_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

// High Priority - UI Framework
const MUI_EXTERNALS = [
  "@mui/material",
  "@mui/icons-material",
  "@emotion/react",
  "@emotion/styled",
];

// Medium Priority - Data & Mocking
const DATA_EXTERNALS = [
  "@tanstack/react-query",
  "@tanstack/react-query-devtools",
  "msw",
];

// Medium Priority - API Tools
const API_EXTERNALS = ["openapi-fetch", "openapi-react-query"];

// Lower Priority - Utilities
const UTILITY_EXTERNALS = [
  "swagger-ui-react",
  "@faker-js/faker",
  "openapi-sampler",
];

// All external dependencies combined
const ALL_EXTERNALS = [
  ...REACT_EXTERNALS,
  ...MUI_EXTERNALS,
  ...DATA_EXTERNALS,
  ...API_EXTERNALS,
  ...UTILITY_EXTERNALS,
];

/**
 * Get externals for specific package types
 * @param packageType - Type of package: 'core', 'mui', 'api', 'full'
 * @param additionalExternals - Additional SMBC package externals
 * @returns Array of external dependencies
 */
export function getExternals(
  packageType: string = "full",
  additionalExternals: string[] = [],
): string[] {
  let externals: string[] = [];

  switch (packageType) {
    case "core":
      externals = [...REACT_EXTERNALS];
      break;
    case "mui":
      externals = [...REACT_EXTERNALS, ...MUI_EXTERNALS];
      break;
    case "api":
      externals = [...REACT_EXTERNALS, ...DATA_EXTERNALS, ...API_EXTERNALS];
      break;
    case "full":
    default:
      externals = [...ALL_EXTERNALS];
      break;
  }

  return [...externals, ...additionalExternals];
}

/**
 * Get externals with SMBC package externals for a specific package
 * @param packageType - Type of package
 * @param smbcExternals - SMBC package externals (e.g., ['@smbc/mui-applet-core'])
 * @returns Complete external dependencies list
 */
export function getSMBCExternals(
  packageType: string = "full",
  smbcExternals: string[] = [],
): string[] {
  return getExternals(packageType, smbcExternals);
}

// Export individual categories for flexibility
export {
  REACT_EXTERNALS,
  MUI_EXTERNALS,
  DATA_EXTERNALS,
  API_EXTERNALS,
  UTILITY_EXTERNALS,
  ALL_EXTERNALS,
};
