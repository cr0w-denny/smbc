import { Box } from "@mui/material";
import {
  useHashNavigation,
  useFeatureFlag,
  useFeatureFlagToggle,
  getCurrentApplet,
} from "@smbc/applet-core";
import { HostAppBar } from "@smbc/mui-applet-core";
import { NavigationDrawer } from "./NavigationDrawer";
import { AppletRouter } from "./AppletRouter";
import { HOST, APPLETS } from "../app.config";

export function AppContent() {
  const { currentPath } = useHashNavigation();
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  const currentAppletInfo = getCurrentApplet(currentPath, APPLETS);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <HostAppBar
        currentAppletInfo={currentAppletInfo}
        isDarkMode={isDarkMode}
        onDarkModeToggle={toggleDarkMode}
        drawerWidth={HOST.drawerWidth}
        showAppletClickToCopy={false}
        showMockControls={false}
      />
      <NavigationDrawer />
      <AppletRouter />
    </Box>
  );
}