/**
 * External dependency management for SMBC applets.
 * These dependencies should not be bundled with the applet.
 */

// Core React dependencies
export const REACT_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

// MUI dependencies
export const MUI_EXTERNALS = [
  "@mui/material",
  "@mui/material/styles",
  "@mui/icons-material",
  "@mui/x-data-grid",
  "@mui/x-tree-view",
  "@mui/x-tree-view/SimpleTreeView",
  "@mui/x-tree-view/TreeItem",
  "@emotion/react",
  "@emotion/styled",
];

// Data fetching and state management
export const API_EXTERNALS = [
  "@tanstack/react-query",
  "openapi-fetch",
  "msw",
  "msw/browser",
];

// Third-party grid and data visualization libraries
export const GRID_EXTERNALS = [
  /^ag-grid-.*/, // Regex pattern to catch all ag-grid packages
  "ag-grid-community",
  "ag-grid-enterprise",
  "ag-grid-react",
];

// Rich text editor libraries
export const EDITOR_EXTERNALS = [
  "@tiptap/core",
  "@tiptap/pm",
  "@tiptap/react",
  "@tiptap/starter-kit",
  "@tiptap/extension-placeholder",
  "@tiptap/extension-highlight",
  "@tiptap/extension-task-list",
  "@tiptap/extension-task-item",
  "@tiptap/extension-character-count",
];

// SMBC packages
export const SMBC_CORE_EXTERNALS = [
  "@smbc/applet-core",
  "@smbc/mui-applet-core",
  "@smbc/mui-components",
  "@smbc/dataview",
  /^@smbc\/.*-api$/, // All SMBC API packages
  "@smbc/ui-core",
];

// Full external patterns that work effectively
export const FULL_EXTERNALS = [
  // React core
  "react",
  "react-dom",
  "react/jsx-runtime",

  // MUI - externalize everything
  /^@mui\/.*/,

  // Emotion (MUI dependency)
  /^@emotion\/.*/,

  // AG Grid
  /^ag-grid-.*/,

  // ECharts
  "echarts",
  "echarts-for-react",
  /^echarts\/.*/,

  // Tiptap - Rich text editor
  /^@tiptap\/.*/,

  // Date libraries
  /^date-fns.*/,
  "@date-io/date-fns",

  // Internal packages
  /^@smbc\/.*/,

  // React Query
  "@tanstack/react-query",

  // Any other large libraries
  "axios",
  "lodash",
  /^lodash\/.*/,
  "framer-motion",
];

// Preset combinations
export const EXTERNALS_PRESETS = {
  core: [...REACT_EXTERNALS],
  mui: [...REACT_EXTERNALS, ...MUI_EXTERNALS],
  api: [...REACT_EXTERNALS, ...API_EXTERNALS],
  full: [...FULL_EXTERNALS],
};

/**
 * Get a predefined set of external dependencies
 */
export function getExternals(
  preset: keyof typeof EXTERNALS_PRESETS = "full",
  additional: (string | RegExp)[] = [],
): (string | RegExp)[] {
  const baseExternals = EXTERNALS_PRESETS[preset] || EXTERNALS_PRESETS.full;
  return [...baseExternals, ...additional];
}

/**
 * Get SMBC-specific external dependencies
 * @param additionalPackages Additional SMBC packages to externalize
 */
export function getSMBCExternals(
  additionalPackages: string[] = [],
): (string | RegExp)[] {
  const smbcPackages = [
    ...SMBC_CORE_EXTERNALS,
    ...additionalPackages.map((pkg) =>
      pkg.startsWith("@smbc/") ? pkg : `@smbc/${pkg}`,
    ),
  ];
  return smbcPackages;
}
