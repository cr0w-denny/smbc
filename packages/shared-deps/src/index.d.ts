export interface AppletDoc {
  markdown: string;
  html: string;
}

export interface AppletDocs {
  [appletId: string]: {
    frontend?: AppletDoc;
    backend?: AppletDoc;
  };
}

export const CORE_DEPS: Record<string, string>;
export const SMBC_PACKAGES: string[];
export const CORE_PEER_DEPS: Record<string, string>;
export const APPLET_DOCS: AppletDocs;

export function getAppletDocs(appletId: string): { frontend?: AppletDoc; backend?: AppletDoc } | undefined;
export function hasBackendDocs(appletId: string): boolean;