import { useHashNavigation, useApplets, useAppletCore, type HostAppletRoute } from '@smbc/applet-core';
import { useEffect } from 'react';

interface AppletRouterProps {
  /** Optional component to render when no routes match */
  defaultComponent?: React.ComponentType;
  /** Request headers to pass to applet components */
  requestHeaders?: Record<string, string>;
}

/**
 * Pure routing component that renders the appropriate applet based on the current hash path.
 * Does not provide any styling or layout - just renders the matched component.
 */
export function AppletRouter({ defaultComponent: DefaultComponent, requestHeaders }: AppletRouterProps) {
  const applets = useApplets();
  const { path } = useHashNavigation();

  // Collect all matching routes
  const matches: { applet: any; route: HostAppletRoute }[] = [];

  for (const applet of applets) {
    for (const route of applet.routes) {
      if (path.startsWith(route.path)) {
        matches.push({ applet, route });
      }
    }
  }

  // Sort by path length (longest first) for most specific match
  matches.sort((a, b) => b.route.path.length - a.route.path.length);

  const bestMatch = matches[0];

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    const debugEntry = {
      id: `${Date.now()}-routing`,
      timestamp: new Date().toISOString(),
      component: 'AppletRouter',
      event: 'route-matching',
      data: {
        path,
        matchCount: matches.length,
        bestMatch: bestMatch ? {
          appletId: bestMatch.applet.id,
          routePath: bestMatch.route.path
        } : null,
        allMatches: matches.map(m => ({
          appletId: m.applet.id,
          routePath: m.route.path
        }))
      }
    };

    // Add to global debug logs if available
    if ((window as any).__debugLogs) {
      (window as any).__debugLogs.push(debugEntry);
    } else {
      (window as any).__debugLogs = [debugEntry];
    }

    console.log(`🐛 AppletRouter:route-matching [${debugEntry.id}]`, debugEntry.data);
  }

  if (bestMatch) {
    const Component = bestMatch.route.component;
    return <Component key={bestMatch.applet.id} requestHeaders={requestHeaders} />;
  }

  // Render default component if provided, otherwise null
  return DefaultComponent ? <DefaultComponent /> : null;
}