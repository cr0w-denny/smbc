/**
 * Vite plugin to suppress "use client" directive warnings from dependencies
 * These warnings occur when bundling React Server Component libraries
 * in client-side applications where the directives are not relevant.
 */

import type { Plugin } from "vite";

export function suppressUseClientWarnings(): Plugin {
  return {
    name: "suppress-use-client-warnings",
    config(config) {
      // Modify the build configuration to suppress warnings
      config.build = config.build || {};
      config.build.rollupOptions = config.build.rollupOptions || {};
      config.build.rollupOptions.onwarn = (warning, warn) => {
        // Suppress warnings about "use client" directives being ignored
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"')
        ) {
          return;
        }

        // Suppress warnings about "use server" directives being ignored
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use server"')
        ) {
          return;
        }

        // Let other warnings through
        warn(warning);
      };
    },
  };
}
