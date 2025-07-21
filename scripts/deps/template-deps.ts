/**
 * Template dependency utilities for create-host and create-applet
 * This ensures all generated projects use the same dependency versions
 * as defined in shared-deps.js
 */

import { CORE_DEPS } from "@smbc/applet-meta";

interface DependencyGroup {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Get dependencies for a MUI host application
 */
export function getMuiHostDependencies(): DependencyGroup {
  return {
    dependencies: {
      // Core React
      react: CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],

      // MUI
      "@mui/material": CORE_DEPS["@mui/material"],
      "@mui/icons-material": CORE_DEPS["@mui/icons-material"],
      "@emotion/react": CORE_DEPS["@emotion/react"],
      "@emotion/styled": CORE_DEPS["@emotion/styled"],

      // State management
      "@tanstack/react-query": CORE_DEPS["@tanstack/react-query"],

      // SMBC Host Meta-Package (installs all SMBC packages)
      "@smbc/applet-host": "*",
    },

    devDependencies: {
      // Types
      "@types/react": CORE_DEPS["@types/react"],
      "@types/react-dom": CORE_DEPS["@types/react-dom"],

      // Build tools
      typescript: CORE_DEPS["typescript"],
      vite: CORE_DEPS["vite"],
      "@vitejs/plugin-react": CORE_DEPS["@vitejs/plugin-react"],

      // Linting
      eslint: CORE_DEPS["eslint"],
      "@typescript-eslint/eslint-plugin":
        CORE_DEPS["@typescript-eslint/eslint-plugin"],
      "@typescript-eslint/parser": CORE_DEPS["@typescript-eslint/parser"],
    },
  };
}

/**
 * Get dependencies for a host application (framework-agnostic wrapper)
 */
export function getHostDependencies(
  framework: string = "mui",
): DependencyGroup {
  switch (framework) {
    case "mui":
      return getMuiHostDependencies();
    // Future frameworks can be added here:
    // case 'vue':
    //   return getVueHostDependencies();
    // case 'angular':
    //   return getAngularHostDependencies();
    default:
      throw new Error(
        `Unsupported framework: ${framework}. Supported frameworks: mui`,
      );
  }
}

/**
 * Get dependencies for a basic applet (no special features)
 */
export function getBasicAppletDependencies(): DependencyGroup {
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
      typescript: CORE_DEPS["typescript"],
      "@smbc/vite-config": "*",

      // Peer dependencies (for development)
      react: CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],
    },

    peerDependencies: {
      react: CORE_DEPS["react"],
      "react-dom": CORE_DEPS["react-dom"],
      "@smbc/applet-core": "*",
    },
  };
}

/**
 * Get dependencies for a full applet (with MUI and data features)
 */
export function getFullAppletDependencies(): DependencyGroup {
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
      msw: CORE_DEPS["msw"],
    },
  };
}

/**
 * Get dependencies for an API package (TypeSpec)
 */
export function getApiDependencies(): Partial<DependencyGroup> {
  return {
    devDependencies: {
      typescript: CORE_DEPS["typescript"],
      // TypeSpec dependencies would go here
      // (These might need to be added to shared-deps.js)
    },
  };
}

/**
 * Update a package.json object with the correct dependencies
 */
export function updatePackageJsonDependencies(
  packageJson: any,
  dependencyType: string,
  isInMonorepo = false,
  framework = "mui",
): any {
  let deps;

  switch (dependencyType) {
    case "host":
      deps = getHostDependencies(framework);
      break;
    case "basic-applet":
      deps = getBasicAppletDependencies();
      break;
    case "full-applet":
      deps = getFullAppletDependencies();
      break;
    case "api":
      deps = getApiDependencies();
      break;
    default:
      throw new Error(`Unknown dependency type: ${dependencyType}`);
  }

  // If external usage, replace SMBC workspace references with actual versions
  if (!isInMonorepo) {
    if (deps.dependencies) {
      Object.keys(deps.dependencies).forEach((key) => {
        if (key.startsWith("@smbc/") && deps.dependencies![key] === "*") {
          deps.dependencies![key] = "^0.1.0";
        }
      });
    }
  }

  return {
    ...packageJson,
    ...deps,
  };
}
