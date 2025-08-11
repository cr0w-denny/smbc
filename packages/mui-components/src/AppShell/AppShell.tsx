import React from "react";
import { Box } from "@mui/material";
import TopNav from "./components/TopNav";
import { AppShellProps } from "./types";

export const AppShell: React.FC<AppShellProps> = ({
  logo,
  hamburgerMenu,
  navigation,
  children,
  onNavigate,
  currentPath,
  isDarkMode,
  onDarkModeToggle,
  username,
  avatarUrl,
  right,
  activeColor,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopNav
        logo={logo}
        hamburgerMenu={hamburgerMenu}
        navigation={navigation}
        onNavigate={onNavigate}
        currentPath={currentPath}
        isDarkMode={isDarkMode}
        onDarkModeToggle={onDarkModeToggle}
        username={username}
        avatarUrl={avatarUrl}
        right={right}
        activeColor={activeColor}
      />
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
};

export default AppShell;
