import React from "react";
import type { AppletMount } from "@smbc/applet-core";

/**
 * Wraps an applet component to automatically inject the mountPath prop
 * based on the route it's mounted at.
 *
 * @param Component The applet component that expects a mountPath prop
 * @param mountPath The path where the component is mounted
 * @returns A wrapped component that automatically receives mountPath
 */
function withMountPath<P extends { mountPath: string }>(
  Component: React.ComponentType<P>,
  mountPath: string,
): React.ComponentType<Omit<P, "mountPath">> {
  return function MountedComponent(props: Omit<P, "mountPath">) {
    return React.createElement(Component, { ...props, mountPath } as P);
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
 *   }),
 *   // Override servers example:
 *   mountApplet(usageStatsApplet, {
 *     id: "usage-stats",
 *     label: "Usage Analytics",
 *     path: "/usage-stats",
 *     icon: AnalyticsIcon,
 *     permissions: [usageStatsApplet.permissions.VIEW_USAGE_STATS]
 *   }, [
 *     { url: "http://localhost:8003/api/v1", description: "dev" },
 *     { url: "https://api.smbcgroup.com/api/v1", description: "prod" }
 *   ])
 * ];
 */
export function mountApplet(
  applet: {
    component: any;
    apiSpec?: any;
    permissions?: any;
    getHostNavigation?: any;
    version?: string;
  },
  config: {
    id: string;
    label: string;
    path: string;
    icon?: any;
    permissions?: any[];
    apiBaseUrl?: string;
    version?: string;
    filterable?: boolean;
  },
  servers?: Array<{ url: string; description?: string }>,
): AppletMount {
  if (!applet.component) {
    throw new Error(`Applet ${config.id} must export a component`);
  }

  let finalApiSpec = applet.apiSpec;

  // Handle servers override - replace servers with matching descriptions
  if (servers && applet.apiSpec) {
    const existingServers = applet.apiSpec.spec?.servers || [];
    const overrideMap = new Map(
      servers.map((s) => [s.description || s.url, { ...s, variables: {} }]),
    );

    finalApiSpec = {
      name: applet.apiSpec.name,
      spec: {
        ...applet.apiSpec.spec,
        servers: existingServers.map((existing: any) =>
          overrideMap.get(existing.description) || existing,
        ),
      },
    };
  }

  return {
    id: config.id,
    label: config.label,
    apiSpec: finalApiSpec,
    apiBaseUrl: config.apiBaseUrl,
    version: config.version,
    packageName: `@smbc/${config.id}-mui`, // Auto-generate package name
    filterable: config.filterable,
    getHostNavigation: applet.getHostNavigation,
    routes: [
      {
        path: config.path,
        label: config.label,
        component: withMountPath(applet.component, config.path),
        icon: config.icon,
        requiredPermissions: config.permissions?.map((p) => p.id) || [],
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
export function mountApplets(
  appletConfigs: Record<
    string,
    {
      applet: any;
      label: string;
      path: string;
      icon?: any;
      permissions: Record<string, string>;
    }
  >,
): {
  permissionRequirements: Record<
    string,
    { applet: any; permissions: Record<string, string> }
  >;
  mountedApplets: Record<string, AppletMount>;
} {
  const permissionRequirements: Record<
    string,
    { applet: any; permissions: Record<string, string> }
  > = {};
  const mountedApplets: Record<string, AppletMount> = {};

  for (const [id, config] of Object.entries(appletConfigs)) {
    // Add to permission requirements
    permissionRequirements[id] = {
      applet: config.applet,
      permissions: config.permissions,
    };

    // Create mounted applet using mountApplet
    mountedApplets[id] = mountApplet(config.applet, {
      id,
      label: config.label,
      path: config.path,
      icon: config.icon,
      permissions: [], // Will be handled by permission requirements
      version: config.applet.version || "0.0.0",
    });
  }

  return {
    permissionRequirements,
    mountedApplets,
  };
}