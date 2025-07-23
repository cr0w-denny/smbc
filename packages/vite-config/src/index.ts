/**
 * @smbc/vite-config - Shared Vite configuration for SMBC applets
 * 
 * This package provides a standardized build configuration for all SMBC applets,
 * ensuring consistency while allowing customization where needed.
 */

// Main configuration functions
export { createAppletConfig, type AppletConfigOptions } from './presets/applet.js';
export { createBaseConfig } from './presets/base.js';

// Plugins
export { suppressUseClientWarnings } from './plugins/suppress-warnings.js';

// External dependency management
export {
  getExternals,
  getSMBCExternals,
  REACT_EXTERNALS,
  MUI_EXTERNALS,
  API_EXTERNALS,
  SMBC_CORE_EXTERNALS,
  EXTERNALS_PRESETS
} from './externals/index.js';

// Utilities
export { getAppletVersions, injectAppletVersions } from './utils/applet-versions.js';

// Re-export types for convenience
export type { UserConfig, Plugin } from 'vite';