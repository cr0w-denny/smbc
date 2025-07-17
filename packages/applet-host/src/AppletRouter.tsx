import { useHashNavigation, AppletMount } from '@smbc/applet-core';

interface AppletRouterProps {
  /** Array of applet configurations */
  applets: AppletMount[];
  /** Optional component to render when no routes match */
  defaultComponent?: React.ComponentType;
}

/**
 * Pure routing component that renders the appropriate applet based on the current hash path.
 * Does not provide any styling or layout - just renders the matched component.
 */
export function AppletRouter({ applets, defaultComponent: DefaultComponent }: AppletRouterProps) {
  const { currentPath } = useHashNavigation();

  // Find the first matching route
  for (const applet of applets) {
    const matchingRoute = applet.routes.find(route => 
      currentPath.startsWith(route.path)
    );
    
    if (matchingRoute) {
      const Component = matchingRoute.component;
      return <Component key={applet.id} />;
    }
  }

  // Render default component if provided, otherwise null
  return DefaultComponent ? <DefaultComponent /> : null;
}