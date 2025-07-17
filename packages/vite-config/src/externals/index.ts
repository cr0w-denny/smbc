/**
 * External dependency management for SMBC applets.
 * These dependencies should not be bundled with the applet.
 */

// Core React dependencies
export const REACT_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime'
];

// MUI dependencies
export const MUI_EXTERNALS = [
  '@mui/material',
  '@mui/material/styles',
  '@mui/icons-material',
  '@mui/x-data-grid',
  '@mui/x-tree-view',
  '@mui/x-tree-view/SimpleTreeView',
  '@mui/x-tree-view/TreeItem',
  '@emotion/react',
  '@emotion/styled'
];

// Data fetching and state management
export const API_EXTERNALS = [
  '@tanstack/react-query',
  'openapi-fetch',
  'msw',
  'msw/browser'
];

// Third-party grid and data visualization libraries
export const GRID_EXTERNALS = [
  'ag-grid-community',
  'ag-grid-enterprise',
  'ag-grid-react'
];


// SMBC packages
export const SMBC_CORE_EXTERNALS = [
  '@smbc/applet-core',
  '@smbc/mui-applet-core',
  '@smbc/mui-components',
  '@smbc/react-query-dataview'
];

// Preset combinations
export const EXTERNALS_PRESETS = {
  core: [...REACT_EXTERNALS],
  mui: [...REACT_EXTERNALS, ...MUI_EXTERNALS],
  api: [...REACT_EXTERNALS, ...API_EXTERNALS],
  full: [...REACT_EXTERNALS, ...MUI_EXTERNALS, ...API_EXTERNALS, ...GRID_EXTERNALS, ...SMBC_CORE_EXTERNALS]
};

/**
 * Get a predefined set of external dependencies
 */
export function getExternals(preset: keyof typeof EXTERNALS_PRESETS = 'full', additional: string[] = []): string[] {
  const baseExternals = EXTERNALS_PRESETS[preset] || EXTERNALS_PRESETS.full;
  return [...new Set([...baseExternals, ...additional])];
}

/**
 * Get SMBC-specific external dependencies
 * @param additionalPackages Additional SMBC packages to externalize
 */
export function getSMBCExternals(additionalPackages: string[] = []): string[] {
  const smbcPackages = [
    ...SMBC_CORE_EXTERNALS,
    ...additionalPackages.map(pkg => pkg.startsWith('@smbc/') ? pkg : `@smbc/${pkg}`)
  ];
  return [...new Set(smbcPackages)];
}