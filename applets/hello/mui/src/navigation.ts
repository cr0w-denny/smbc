import { createNavigationExport } from "@smbc/applet-core";
import permissions from "./permissions";

// Navigation groups for organizing routes - removed since we want flat navigation
export const navigationGroups: any[] = [];

// Internal routes used by the applet - flat structure
export const internalRoutes = [
  {
    path: "/introduction",
    permission: permissions.VIEW_ROUTE_ONE,
    label: "Introduction",
  },
  {
    path: "/develop",
    permission: permissions.VIEW_ROUTE_TWO,
    label: "Develop",
  },
  {
    path: "/deploy",
    permission: permissions.VIEW_ROUTE_THREE,
    label: "Deploy",
  },
  {
    path: "/integrate",
    permission: permissions.VIEW_ROUTE_FOUR,
    label: "Integrate",
  },
];

// Export internal navigation structure for the host to display - no groups defined
export const getHostNavigation = createNavigationExport({ 
  routes: internalRoutes 
});
