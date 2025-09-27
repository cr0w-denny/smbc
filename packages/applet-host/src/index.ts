/**
 * @smbc/mui-applet-host
 *
 * Meta-package that installs all SMBC MUI host dependencies
 * and provides convenience utilities for building applet host applications.
 *
 * Installing this package makes all individual SMBC packages available
 * for direct import (e.g., import { DevHostAppBar } from '@smbc/mui-components')
 * while also providing convenient bundled utilities.
 */

// =============================================================================
// CONVENIENCE UTILITIES (ONLY FROM THIS PACKAGE)
// =============================================================================
export { AppletRouter } from "./AppletRouter";
export { AppletHost } from "./AppletHost";

// =============================================================================
// HOST-SPECIFIC HOOKS
// =============================================================================
export { useAppletMenus } from "./hooks/useAppletMenus";
export { usePermissionFilteredRoutes } from "./hooks/usePermissionFilteredRoutes";
export { useRoleManagement } from "./hooks/useRoleManagement";

// =============================================================================
// HOST-SPECIFIC UTILITIES
// =============================================================================
export { getAllRoutes, getCurrentApplet } from "./utils/applet-utils";
export { mountApplet, mountApplets } from "./utils/mounting";
export { configureApplets, getAppletConfig, getAllApplets } from "./utils/applet-registry";
export { getPackageVersion } from "./utils/get-package-version";
export { createapiOverrides, type ServerOverrideMapping, type ServerOverrideFunction } from "./utils/createServerOverrideFunction";
