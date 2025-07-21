import { createNavigationExport } from "@smbc/applet-core";

// No internal routes for this simple demo applet
export const getHostNavigation = createNavigationExport({ 
  routes: [] 
});