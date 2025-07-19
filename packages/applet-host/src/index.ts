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
