import React, { useRef, useLayoutEffect } from "react";
import { Box } from "@mui/material";

export interface ToolbarProps {
  children: React.ReactNode;
  variant?: "default" | "extended";
  darkMode?: boolean;
}

/**
 * Fixed positioned toolbar for AppShell-based applications
 * Positioned relative to AppShell's header
 * Automatically communicates its height to following Content elements via CSS custom property
 *
 * Respects CSS custom properties:
 * - `--appshell-header-height`: Top offset (default: 104px)
 * - `--appshell-left-offset`: Left offset for sidebars (default: 0px)
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  children,
  variant = "default",
  darkMode = false,
}) => {
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
      {variant === "extended" && !darkMode && (
        <Box
          sx={{
            position: "fixed",
            top: "var(--appshell-header-height, 104px)",
            left: "var(--appshell-left-offset, 0px)",
            right: 0,
            height: "200px", // Extend below toolbar
            backgroundColor: "#232B2F",
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
          left: "var(--appshell-left-offset, 0px)",
          right: 0,
          zIndex: 1002, // Above background
          py: 2,
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Toolbar;
