/**
 * TypeScript declarations for metadata.js
 */

export interface AppletMetadata {
  name: string;
  description: string;
  framework: string;
  icon: string;
  path: string;
  permissions: string[];
  exportName: string;
}

export const CORE_DEPS: Record<string, string>;
export const SMBC_PACKAGES: string[];
export const APPLET_METADATA: Record<string, AppletMetadata>;

export function getAppletsByFramework(framework?: string): Array<{
  packageName: string;
} & AppletMetadata>;