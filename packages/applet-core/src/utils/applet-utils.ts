import type { AppletMount, HostAppletRoute } from "../types";

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
  // Collect all matching routes with their applets
  const matches: { applet: AppletMount; route: any }[] = [];

  for (const hostApplet of applets) {
    for (const route of hostApplet.routes) {
      if (path.startsWith(route.path)) {
        matches.push({ applet: hostApplet, route });
      }
    }
  }

  // Sort by path length (longest first) to prefer more specific matches
  matches.sort((a, b) => b.route.path.length - a.route.path.length);

  // Return the most specific match
  return matches[0]?.applet || null;
}
