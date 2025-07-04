/**
 * @smbc/vite-config - Shared Vite configuration for SMBC applets
 * 
 * This package provides a standardized build configuration for all SMBC applets,
 * ensuring consistency while allowing customization where needed.
 */

// Main configuration functions
export { createAppletConfig, type AppletConfigOptions } from './presets/applet';
export { createBaseConfig } from './presets/base';

// Plugins
export { suppressUseClientWarnings } from './plugins/suppress-warnings';

// External dependency management
export {
  getExternals,
  getSMBCExternals,
  REACT_EXTERNALS,
  MUI_EXTERNALS,
  API_EXTERNALS,
  SMBC_CORE_EXTERNALS,
  EXTERNALS_PRESETS
} from './externals';

// Re-export types for convenience
export type { UserConfig, Plugin } from 'vite';