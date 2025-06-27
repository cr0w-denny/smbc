// =============================================================================
// SMBC MUI Host - Applet Route Component
// =============================================================================

import { Suspense } from "react";
import { useApp } from "@smbc/applet-core";
import { AppletRouteProps } from "./types";

/**
 * AppletRoute - Component for mounting applets in existing routing systems
 *
 * This component allows existing apps to mount SMBC applets at specific routes
 * without requiring them to adopt the full SMBC app shell or navigation.
 */
export function AppletRoute({
  applet: appletId,
  mountPath,
  fallback: Fallback,
}: AppletRouteProps) {
  const { state } = useApp();
  const appletRegistry = state.appletRegistry || {};

  const applet = appletRegistry?.[appletId];

  if (!applet) {
    if (Fallback) {
      return <Fallback />;
    }
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Applet Not Found</h2>
        <p>The applet "{appletId}" could not be loaded.</p>
        <p>Make sure it's properly configured in your AppletProvider.</p>
      </div>
    );
  }

  const AppletComponent = applet.component;
  const effectiveMountPath = mountPath || applet.mountPath || `/${appletId}`;

  return (
    <Suspense fallback={<div>Loading {applet.name}...</div>}>
      <AppletComponent mountPath={effectiveMountPath} />
    </Suspense>
  );
}

/**
 * Higher-order component for lazy loading applet routes
 */
export function withAppletRoute(appletId: string, mountPath?: string) {
  return function AppletRouteWrapper() {
    return <AppletRoute applet={appletId} mountPath={mountPath} />;
  };
}

/**
 * Hook for getting applet information in route components
 */
export function useAppletRoute(appletId: string) {
  const { state } = useApp();
  const appletRegistry = state.appletRegistry || {};
  const applet = appletRegistry?.[appletId];

  return {
    applet,
    isLoaded: !!applet,
    name: applet?.name,
    mountPath: applet?.mountPath,
    permissions: applet?.permissions,
  };
}
