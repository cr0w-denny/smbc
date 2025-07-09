/**
 * Pure AppShell component - layout only, no business logic
 */

import React from "react";
import { Box, AppBar } from "@mui/material";
import { AppToolbar } from "./AppToolbar";
import { AppMainContent } from "./AppMainContent";
import type { AppShellProps } from "./types";

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title = "Application",
  elevation = 1,

  showDrawer = false,
  drawerOpen = false,
  drawerWidth = 280,
  drawerContent,
  onDrawerClose,
  drawerVariant = "temporary",

  isMobile = false,

  toolbarProps = {},
}) => {
  const appBarStyles = {
    width:
      showDrawer && !isMobile && drawerOpen
        ? `calc(100% - ${drawerWidth}px)`
        : "100%",
    ml: showDrawer && !isMobile && drawerOpen ? `${drawerWidth}px` : 0,
    transition: "margin 0.3s ease, width 0.3s ease",
    zIndex: (theme: any) => theme.zIndex.drawer + 1,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="fixed" elevation={elevation} sx={appBarStyles}>
        <AppToolbar title={title} {...toolbarProps} />
      </AppBar>

      {/* Navigation Drawer */}
      {showDrawer && drawerContent && (
        <Box component="nav">
          {React.cloneElement(drawerContent as React.ReactElement, {
            open: drawerOpen,
            onClose: onDrawerClose,
            width: drawerWidth,
            variant: drawerVariant,
          })}
        </Box>
      )}

      {/* Main Content */}
      <AppMainContent
        drawerWidth={drawerWidth}
        showDrawer={showDrawer && drawerOpen}
        isMobile={isMobile}
      >
        {children}
      </AppMainContent>
    </Box>
  );
};
