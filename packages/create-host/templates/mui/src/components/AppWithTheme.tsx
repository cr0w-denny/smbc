import { ThemeProvider, CssBaseline } from "@mui/material";
import { useFeatureFlag } from "@smbc/applet-core";
import { lightTheme, darkTheme } from "@smbc/mui-components";
import { AppContent } from "./AppContent";

export function AppWithTheme() {
  const isDarkMode = useFeatureFlag<boolean>("darkMode") || false;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}
