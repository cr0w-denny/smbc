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
  const gradient =
    "linear-gradient(116.47deg, rgba(13, 21, 36, 0.905882) -3.25%, #0B1220 30.67%, #070F1A 61.84%, #040B13 105.6%)";

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
            backgroundColor: ui.color.navigation.background.light,
            zIndex: 1000, // Behind toolbar content
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
              ? ui.color.navigation.background.light
              : "transparent"
            : gradient,
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Toolbar;
