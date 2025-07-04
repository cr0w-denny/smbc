import React from 'react';
import type { HostAppletDefinition } from './types';

/**
 * Wraps an applet component to automatically inject the mountPath prop
 * based on the route it's mounted at.
 * 
 * @param Component The applet component that expects a mountPath prop
 * @param mountPath The path where the component is mounted
 * @returns A wrapped component that automatically receives mountPath
 */
export function withMountPath<P extends { mountPath: string }>(
  Component: React.ComponentType<P>,
  mountPath: string
): React.ComponentType<Omit<P, 'mountPath'>> {
  return function MountedComponent(props: Omit<P, 'mountPath'>) {
    return React.createElement(Component, { ...props, mountPath } as P);
  };
}

/**
 * Processes applet routes to automatically inject mountPath into components
 * that expect it. This eliminates the need for manual wrapper functions.
 * 
 * @param applet The applet definition with routes
 * @returns A new applet definition with wrapped components
 */
export function processAppletRoutes(applet: HostAppletDefinition): HostAppletDefinition {
  return {
    ...applet,
    routes: applet.routes.map(route => ({
      ...route,
      // Wrap the route component to inject mountPath
      component: withMountPath(route.component, route.path)
    }))
  };
}

/**
 * Creates a host applet definition with automatic mountPath handling.
 * Use this instead of manually wrapping components.
 * 
 * @example
 * export const APPLETS = [
 *   createAppletDefinition(helloWorldApplet, {
 *     id: "hello-world",
 *     label: "Hello World",
 *     path: "/hello-world",
 *     icon: LanguageIcon,
 *     permissions: [helloWorldApplet.permissions.VIEW_ROUTE_ONE]
 *   })
 * ];
 */
export function createAppletDefinition(
  applet: { component: any; apiSpec?: any; permissions?: any },
  config: {
    id: string;
    label: string;
    path: string;
    icon?: any;
    permissions?: any[];
  }
): HostAppletDefinition {
  if (!applet.component) {
    throw new Error(`Applet ${config.id} must export a component`);
  }

  return {
    id: config.id,
    label: config.label,
    apiSpec: applet.apiSpec,
    routes: [
      {
        path: config.path,
        label: config.label,
        component: withMountPath(applet.component, config.path),
        icon: config.icon,
        requiredPermissions: config.permissions?.map(p => p.id) || [],
      },
    ],
  };
}