import { MuiHostApp } from "@smbc/mui-applet-devtools";
import { APPLETS, DEMO_USER, HOST, ROLE_CONFIG } from "./applet.config";
import { allHandlers } from "./generated/mocks";

// Global constant injected by Vite at build time
declare const __APPLET_VERSIONS__: Record<string, string>;

export function App() {
  // Add version info to all applets based on their packageName
  const appletsWithVersions = APPLETS.map((applet) => {
    const version = applet.packageName && __APPLET_VERSIONS__[applet.packageName] 
      ? __APPLET_VERSIONS__[applet.packageName]
      : (applet.version || "");
    
    return {
      ...applet,
      version,
    };
  });
  
  console.log("Applet versions:", __APPLET_VERSIONS__);
  console.log("Mounted applets with versions:", appletsWithVersions);
  return (
    <MuiHostApp
      applets={appletsWithVersions}
      roleConfig={ROLE_CONFIG}
      demoUser={DEMO_USER}
      appName={HOST.appName}
      drawerWidth={HOST.drawerWidth}
      mswHandlers={allHandlers}
      permissionMapping={{ "admin-users": "user-management" }}
      disableMSW={import.meta.env.VITE_DISABLE_MSW === "true"}
      showAppletHeading={true}
    />
  );
}
