import { createNavigationExport } from '@smbc/applet-core';
import permissions from './permissions';

// Navigation groups for organizing routes
export const navigationGroups = [
  { id: "basic", label: "Basic Features", icon: "⚡", order: 1 },
  { id: "advanced", label: "Advanced Features", icon: "🔧", order: 2 }
];

// Internal routes used by the applet
export const internalRoutes = [
  {
    path: "/route-one",
    permission: permissions.VIEW_ROUTE_ONE,
    label: "Route One",
    icon: "🚀",
    group: "basic",
  },
  {
    path: "/route-two", 
    permission: permissions.VIEW_ROUTE_TWO,
    label: "Route Two",
    icon: "🌟",
    group: "basic",
  },
  {
    path: "/route-three",
    permission: permissions.VIEW_ROUTE_THREE,
    label: "Route Three", 
    icon: "🎉",
    group: "advanced",
  },
];

// Export internal navigation structure for the host to display
export const getHostNavigation = createNavigationExport({
  groups: navigationGroups,
  routes: internalRoutes,
  homeRoute: {
    label: "Home",
    icon: "🏠"
  }
});