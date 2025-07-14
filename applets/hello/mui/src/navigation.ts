import { createNavigationExport } from "@smbc/applet-core";
import permissions from "./permissions";
import {
  Home as IntroductionIcon,
  Code as DevelopIcon,
  Rocket as DeployIcon,
  Extension as IntegrateIcon,
} from "@mui/icons-material";

// Navigation groups for organizing routes - removed since we want flat navigation
export const navigationGroups: any[] = [];

// Internal routes for useInternalNavigation (icon as string)
export const internalRoutes = [
  {
    path: "/introduction",
    permission: permissions.VIEW_ROUTE_ONE,
    label: "Introduction",
    icon: "🏠",
  },
  {
    path: "/develop",
    permission: permissions.VIEW_ROUTE_TWO,
    label: "Develop",
    icon: "💻",
  },
  {
    path: "/deploy",
    permission: permissions.VIEW_ROUTE_THREE,
    label: "Deploy",
    icon: "🚀",
  },
  {
    path: "/integrate",
    permission: permissions.VIEW_ROUTE_FOUR,
    label: "Integrate",
    icon: "🔧",
  },
];

// Routes with Material-UI icons for components that need them
export const routesWithIcons = [
  {
    path: "/introduction",
    permission: permissions.VIEW_ROUTE_ONE,
    label: "Introduction",
    icon: IntroductionIcon,
  },
  {
    path: "/develop",
    permission: permissions.VIEW_ROUTE_TWO,
    label: "Develop", 
    icon: DevelopIcon,
  },
  {
    path: "/deploy",
    permission: permissions.VIEW_ROUTE_THREE,
    label: "Deploy",
    icon: DeployIcon,
  },
  {
    path: "/integrate",
    permission: permissions.VIEW_ROUTE_FOUR,
    label: "Integrate",
    icon: IntegrateIcon,
  },
];

// Export internal navigation structure for the host to display - no groups defined
export const getHostNavigation = createNavigationExport({ 
  routes: internalRoutes 
});
