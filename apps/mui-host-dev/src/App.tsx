import { MuiHostApp } from "@smbc/mui-applet-devtools";
import { APPLETS, DEMO_USER, HOST, ROLE_CONFIG } from "./applet.config";
import { allHandlers } from "./generated/mocks";

export function App() {
  return (
    <MuiHostApp
      applets={APPLETS}
      roleConfig={ROLE_CONFIG}
      demoUser={DEMO_USER}
      appName={HOST.appName}
      drawerWidth={HOST.drawerWidth}
      mswHandlers={allHandlers}
      permissionMapping={{ "admin-users": "user-management" }}
      disableMSW={import.meta.env.VITE_DISABLE_MSW === "true"}
    />
  );
}
