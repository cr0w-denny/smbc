/**
 * SMBC applet metadata and dependency management
 * 
 * This file provides centralized metadata for all SMBC applets and
 * manages shared dependency versions across the monorepo.
 * 
 * NOTE: This file is intentionally kept as .js to avoid being deleted by clean-ts
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

// Framework-aware applet metadata for installation and configuration
export const APPLET_METADATA = {
  '@smbc/hello-mui': {
    id: 'hello',
    name: 'Hello World',
    description: 'Simple hello world applet for testing and demos',
    framework: 'mui',
    icon: 'Waving Hand',
    path: '/hello',
    permissions: [],
    exportName: 'helloApplet',
  },
  '@smbc/user-management-mui': {
    id: 'user-management',
    name: 'User Management',
    description: 'Comprehensive user management with roles and permissions',
    framework: 'mui', 
    icon: 'People',
    path: '/users',
    permissions: ['users.read', 'users.write'],
    exportName: 'userManagementApplet',
  },
  '@smbc/product-catalog-mui': {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'Product catalog management and browsing',
    framework: 'mui',
    icon: 'Inventory',
    path: '/products', 
    permissions: ['products.read'],
    exportName: 'productCatalogApplet',
  },
  '@smbc/usage-stats-mui': {
    id: 'usage-stats',
    name: 'Usage Stats',
    description: 'Dashboard for tracking usage statistics',
    framework: 'mui',
    icon: 'BarChart',
    path: '/usage-stats',
    permissions: ['usage-stats.read'],
    exportName: 'usageStatsApplet',
  },
  '@smbc/employee-directory-mui': {
    id: 'employee-directory',
    name: 'Employee Directory',
    description: 'Employee directory and contact management',
    framework: 'mui',
    icon: 'ContactPage',
    path: '/employees',
    permissions: ['employees.read'],
    exportName: 'employeeDirectoryApplet',
  },
};

/**
 * Get applets filtered by framework
 */
export function getAppletsByFramework(framework = 'mui') {
  return Object.entries(APPLET_METADATA)
    .filter(([, metadata]) => metadata.framework === framework)
    .map(([packageName, metadata]) => ({
      packageName,
      ...metadata
    }));
}