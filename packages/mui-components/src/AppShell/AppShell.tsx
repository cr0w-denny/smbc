import React from "react";
import { Box } from "@mui/material";
import TopNav from "./components/TopNav";
import { AppShellProps } from "./types";
import { getSemanticColor } from "@smbc/ui-core";

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
  maxWidth,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        isolation: "isolate",
      }}
    >
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
        maxWidth={maxWidth}
      />
      <Box
        sx={{
          flexGrow: 1,
          marginTop: "104px", // Account for fixed header height
          background: (() => {
            const color = getSemanticColor(
              "surface.body",
              isDarkMode ? "dark" : "light",
            );
            const fallbackColor = isDarkMode ? "#242b2f" : "#fafafa";
            const actualColor = color || fallbackColor;

            return isDarkMode
              ? actualColor // Fill entire page in dark mode
              : `linear-gradient(to bottom, 
                #242b2f 0px,
                #242b2f 190px,
                transparent 190px
              )`; // Light mode gets dark gradient
          })(),
        }}
      >
        {maxWidth ? (
          <Box
            sx={{
              maxWidth,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

export default AppShell;
