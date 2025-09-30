import React, { useRef, useLayoutEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { ui } from "@smbc/ui-core";

export interface ToolbarProps {
  children: React.ReactNode;
  variant?: "default" | "extended";
}

/**
 * Fixed positioned toolbar for AppShell-based applications.
 * Positioned relative to AppShell's header and handles theming appropriately.
 * Automatically communicates its height to following Content elements via CSS custom property.
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  children,
  variant = "default",
}) => {
  const theme = useTheme();
  const isLightMode = theme.palette.mode === "light";
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Calculate and set toolbar height as CSS custom property
  useLayoutEffect(() => {
    if (toolbarRef.current) {
      const height = toolbarRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--appshell-toolbar-height",
        `${height}px`,
      );
    }
  });

  return (
    <>
      {/* Background extension for light mode */}
      {variant === "extended" && isLightMode && (
        <Box
          sx={{
            position: "fixed",
            top: "var(--appshell-header-height, 104px)",
            left: 0,
            right: 0,
            height: "200px", // Extend below toolbar
            backgroundColor: ui.navigation.base.default.background.light,
            zIndex: -1, // Behind everything else
          }}
        />
      )}

      {/* Main toolbar container */}
      <Box
        ref={toolbarRef}
        className={`AppShell-toolbar AppShell-toolbar--${variant}`}
        sx={{
          position: "fixed",
          top: "var(--appshell-header-height, 104px)",
          left: 0,
          right: 0,
          zIndex: 1002, // Above background
          py: 2,
          background: isLightMode
            ? variant === "extended"
              ? ui.navigation.base.default.background.light
              : "transparent"
            : "linear-gradient(to bottom right, red, white)",
          // Clip to show only toolbar portion of gradient (assuming ~80px toolbar height in ~100vh viewport)
          ...(isLightMode ? {} : {
            backgroundSize: "100vw 100vh",
            backgroundAttachment: "fixed",
            backgroundPosition: "0 0",
          }),
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Toolbar;
