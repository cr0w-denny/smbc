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
            left: 0,
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
          left: 0,
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
