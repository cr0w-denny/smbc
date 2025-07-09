import type { Plugin } from 'vite';

/**
 * Vite plugin to suppress 'use client' directive warnings during build.
 * These warnings occur when libraries include React Server Component directives
 * that aren't relevant for client-side builds.
 */
export function suppressUseClientWarnings(): Plugin {
  return {
    name: 'suppress-use-client-warnings',
    enforce: 'pre',
    transform(code: string, id: string) {
      // Remove 'use client' directives from source files
      if (id.includes('node_modules') || id.endsWith('.js') || id.endsWith('.jsx') || id.endsWith('.ts') || id.endsWith('.tsx')) {
        if (code.startsWith('"use client"') || code.startsWith("'use client'")) {
          return {
            code: code.replace(/^['"]use client['"];?\s*\n?/, ''),
            map: null
          };
        }
      }
      return null;
    }
  };
}