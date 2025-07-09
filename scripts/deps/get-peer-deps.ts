#!/usr/bin/env tsx

/**
 * Utility script to get peer dependencies for the DevHostAppBar
 * This bridges the gap between the shared-deps.js file and React components
 */

import { CORE_PEER_DEPS } from "../../packages/shared-deps/src/index.js";

// Output as JSON so it can be consumed by other tools
console.log(JSON.stringify(CORE_PEER_DEPS, null, 2));