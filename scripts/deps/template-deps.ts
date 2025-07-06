/**
 * Template dependency utilities for create-host and create-applet
 * This ensures all generated projects use the same dependency versions
 * as defined in shared-deps.js
 */

import { CORE_DEPS, SMBC_PACKAGES } from './shared-deps.js';

interface DependencyGroup {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Get dependencies for a host application
 */
export function getHostDependencies(): DependencyGroup {
  return {
    dependencies: {
      // Core React
      "react": CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],
      
      // MUI
      "@mui/material": CORE_DEPS["@mui/material"],
      "@mui/icons-material": CORE_DEPS["@mui/icons-material"],
      "@emotion/react": CORE_DEPS["@emotion/react"],
      "@emotion/styled": CORE_DEPS["@emotion/styled"],
      
      // State management
      "@tanstack/react-query": CORE_DEPS["@tanstack/react-query"],
      "@tanstack/react-query-devtools": CORE_DEPS["@tanstack/react-query-devtools"],
      
      // SMBC Host Meta-Package (installs all SMBC packages)
      "@smbc/mui-applet-host": "*",
      
      // Development/Testing tools
      "msw": CORE_DEPS["msw"],
    },
    
    devDependencies: {
      // Types
      "@types/react": CORE_DEPS["@types/react"],
      "@types/react-dom": CORE_DEPS["@types/react-dom"],
      
      // Build tools
      "typescript": CORE_DEPS["typescript"],
      "vite": CORE_DEPS["vite"],
      "@vitejs/plugin-react": CORE_DEPS["@vitejs/plugin-react"],
      
      // Linting
      "eslint": CORE_DEPS["eslint"],
      "@typescript-eslint/eslint-plugin": CORE_DEPS["@typescript-eslint/eslint-plugin"],
      "@typescript-eslint/parser": CORE_DEPS["@typescript-eslint/parser"],
    }
  };
}

/**
 * Get dependencies for a basic applet (no special features)
 */
export function getBasicAppletDependencies() {
  return {
    dependencies: {
      // SMBC Core (required for all applets)
      "@smbc/applet-core": "*",
    },
    
    devDependencies: {
      // Types
      "@types/react": CORE_DEPS["@types/react"],
      "@types/react-dom": CORE_DEPS["@types/react-dom"],
      
      // Build tools
      "typescript": CORE_DEPS["typescript"],
      "@smbc/vite-config": "*",
      
      // Peer dependencies (for development)
      "react": CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],
    },
    
    peerDependencies: {
      "react": CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],
      "@smbc/applet-core": "*",
    }
  };
}

/**
 * Get dependencies for a full applet (with MUI and data features)
 */
export function getFullAppletDependencies() {
  const basic = getBasicAppletDependencies();
  
  return {
    dependencies: {
      ...basic.dependencies,
      // Add SMBC packages for full functionality
      "@smbc/mui-components": "*",
      "@smbc/react-query-dataview": "*",
    },
    
    devDependencies: {
      ...basic.devDependencies,
    },
    
    peerDependencies: {
      ...basic.peerDependencies,
      // MUI
      "@mui/material": CORE_DEPS["@mui/material"],
      "@mui/icons-material": CORE_DEPS["@mui/icons-material"],
      "@emotion/react": CORE_DEPS["@emotion/react"],
      "@emotion/styled": CORE_DEPS["@emotion/styled"],
      
      // State management  
      "@tanstack/react-query": CORE_DEPS["@tanstack/react-query"],
      
      // SMBC packages
      "@smbc/mui-components": "*",
      "@smbc/react-query-dataview": "*",
      
      // Development/Testing
      "msw": CORE_DEPS["msw"],
    }
  };
}

/**
 * Get dependencies for an API package (TypeSpec)
 */
export function getApiDependencies() {
  return {
    devDependencies: {
      "typescript": CORE_DEPS["typescript"],
      // TypeSpec dependencies would go here
      // (These might need to be added to shared-deps.js)
    }
  };
}

/**
 * Update a package.json object with the correct dependencies
 */
export function updatePackageJsonDependencies(packageJson, dependencyType) {
  let deps;
  
  switch (dependencyType) {
    case 'host':
      deps = getHostDependencies();
      break;
    case 'basic-applet':
      deps = getBasicAppletDependencies();
      break;
    case 'full-applet':
      deps = getFullAppletDependencies();
      break;
    case 'api':
      deps = getApiDependencies();
      break;
    default:
      throw new Error(`Unknown dependency type: ${dependencyType}`);
  }
  
  return {
    ...packageJson,
    ...deps
  };
}