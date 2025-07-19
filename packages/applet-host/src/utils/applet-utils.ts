import type { AppletMount, HostAppletRoute } from "@smbc/applet-core";

/**
 * Get all routes from all applets
 */
export function getAllRoutes(
  applets: AppletMount[],
): HostAppletRoute[] {
  const appletRoutes = applets.flatMap((applet) => applet.routes);
  return appletRoutes;
}

/**
 * Get the current applet based on path
 */
export function getCurrentApplet(
  path: string,
  applets: AppletMount[],
) {
  // Check if path matches any route in any applet
  for (const hostApplet of applets) {
    for (const route of hostApplet.routes) {
      if (path.startsWith(route.path)) {
        return hostApplet;
      }
    }
  }
  return null;
}