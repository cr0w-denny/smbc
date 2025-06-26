// =============================================================================
// SMBC External Dependencies Configuration
// =============================================================================

/**
 * Comprehensive list of third-party dependencies that should be externalized
 * across all SMBC packages to avoid duplication and enable proper version
 * management at the host application level.
 */

// High Priority - Core Framework
export const REACT_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
] as const;

// High Priority - UI Framework  
export const MUI_EXTERNALS = [
  '@mui/material',
  '@mui/icons-material',
  '@emotion/react',
  '@emotion/styled',
] as const;

// Medium Priority - Data & Mocking
export const DATA_EXTERNALS = [
  '@tanstack/react-query',
  '@tanstack/react-query-devtools',
  'msw',
] as const;

// Medium Priority - API Tools
export const API_EXTERNALS = [
  'openapi-fetch',
  'openapi-react-query',
] as const;

// Lower Priority - Utilities
export const UTILITY_EXTERNALS = [
  'swagger-ui-react',
  '@faker-js/faker',
  'openapi-sampler',
] as const;

// All external dependencies combined
export const ALL_EXTERNALS = [
  ...REACT_EXTERNALS,
  ...MUI_EXTERNALS,
  ...DATA_EXTERNALS,
  ...API_EXTERNALS,
  ...UTILITY_EXTERNALS,
] as const;

// External dependencies with version constraints for peerDependencies
export const EXTERNAL_VERSIONS = {
  // React ecosystem
  'react': '^18.0.0',
  'react-dom': '^18.0.0',
  
  // MUI ecosystem
  '@mui/material': '^7.0.0',
  '@mui/icons-material': '^7.0.0',
  '@emotion/react': '^11.10.0',
  '@emotion/styled': '^11.10.0',
  
  // TanStack Query
  '@tanstack/react-query': '^5.0.0',
  '@tanstack/react-query-devtools': '^5.0.0',
  
  // MSW
  'msw': '^2.0.0',
  
  // API tools
  'openapi-fetch': '^0.14.0',
  'openapi-react-query': '^0.5.0',
  
  // Utilities
  'swagger-ui-react': '^5.25.0',
  '@faker-js/faker': '^8.0.0',
  'openapi-sampler': '^1.3.0',
} as const;

// Type for external dependency names
export type ExternalDependency = typeof ALL_EXTERNALS[number];

// Helper function to get externals for specific package types
export function getExternalsForPackageType(packageType: 'core' | 'mui' | 'api' | 'full') {
  switch (packageType) {
    case 'core':
      return [...REACT_EXTERNALS];
    case 'mui':
      return [...REACT_EXTERNALS, ...MUI_EXTERNALS];
    case 'api':
      return [...REACT_EXTERNALS, ...DATA_EXTERNALS, ...API_EXTERNALS];
    case 'full':
      return ALL_EXTERNALS;
    default:
      return ALL_EXTERNALS;
  }
}