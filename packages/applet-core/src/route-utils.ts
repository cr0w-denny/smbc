import React from 'react';
import type { AppletMount } from './types';

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
export function processAppletRoutes(applet: AppletMount): AppletMount {
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
 * Mounts an applet in the host application at a specific path with configuration.
 * Use this instead of manually wrapping components.
 * 
 * @example
 * export const APPLETS = [
 *   mountApplet(helloWorldApplet, {
 *     id: "hello-world",
 *     label: "Hello World",
 *     path: "/hello-world",
 *     icon: LanguageIcon,
 *     permissions: [helloWorldApplet.permissions.VIEW_ROUTE_ONE]
 *   })
 * ];
 */
export function mountApplet(
  applet: { component: any; apiSpec?: any; permissions?: any; getHostNavigation?: any },
  config: {
    id: string;
    label: string;
    path: string;
    icon?: any;
    permissions?: any[];
  }
): AppletMount {
  if (!applet.component) {
    throw new Error(`Applet ${config.id} must export a component`);
  }

  return {
    id: config.id,
    label: config.label,
    apiSpec: applet.apiSpec,
    getHostNavigation: applet.getHostNavigation,
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

/**
 * Mounts multiple applets and generates both permission requirements and mounted applets.
 * This is a convenience function that simplifies the common pattern of setting up applets.
 * 
 * @param appletConfigs Object mapping applet IDs to their configurations
 * @returns Object containing both permissionRequirements and mountedApplets
 * 
 * @example
 * const { permissionRequirements, mountedApplets } = mountApplets({
 *   "user-management": {
 *     applet: userManagementApplet,
 *     label: "User Management", 
 *     path: "/user-management",
 *     icon: PeopleIcon,
 *     permissions: {
 *       VIEW_USERS: "Staff",
 *       CREATE_USERS: "Manager",
 *     }
 *   },
 *   "hello": {
 *     applet: helloApplet,
 *     label: "Hello World",
 *     path: "/hello", 
 *     icon: EmojiEmotionsIcon,
 *     permissions: {
 *       VIEW: "User"
 *     }
 *   }
 * });
 */
export function mountApplets(appletConfigs: Record<string, {
  applet: any;
  label: string;
  path: string;
  icon?: any;
  permissions: Record<string, string>;
}>): {
  permissionRequirements: Record<string, { applet: any; permissions: Record<string, string> }>;
  mountedApplets: Record<string, AppletMount>;
} {
  const permissionRequirements: Record<string, { applet: any; permissions: Record<string, string> }> = {};
  const mountedApplets: Record<string, AppletMount> = {};

  for (const [id, config] of Object.entries(appletConfigs)) {
    // Add to permission requirements
    permissionRequirements[id] = {
      applet: config.applet,
      permissions: config.permissions,
    };

    // Add to mounted applets
    mountedApplets[id] = mountApplet(config.applet, {
      id,
      label: config.label,
      path: config.path,
      icon: config.icon,
    });
  }

  return {
    permissionRequirements,
    mountedApplets,
  };
}

/**
 * Converts mounted applets to the format expected by AppletDrawer.
 * This eliminates the need for verbose manual mapping in App components.
 * 
 * @param applets Record of mounted applets from mountApplets()
 * @returns Array of navigation sections for AppletDrawer
 * 
 * @example
 * const appletSections = createAppletSections(APPLETS);
 * <AppletDrawer appletSections={appletSections} ... />
 */
export function createAppletSections(applets: Record<string, AppletMount>) {
  return Object.values(applets).map(applet => ({
    appletId: applet.id,
    appletLabel: applet.label,
    hasInternalNavigation: false,
    directRoute: applet.routes[0] ? {
      path: applet.routes[0].path,
      label: applet.routes[0].label,
      icon: applet.routes[0].icon,
    } : undefined,
  }));
}