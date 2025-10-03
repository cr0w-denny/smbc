import React, { useRef, useLayoutEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { BackgroundEffect } from "../../BackgroundEffect";
import { Width } from "../../Width";

export interface ToolbarProps {
  children: React.ReactNode;
  mode?: "light" | "dark";
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
export const Toolbar: React.FC<ToolbarProps> = ({ children, mode = "light" }) => {
  const theme = useTheme();
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

  const shouldRenderBackdrop = mode === "dark" && theme.palette.mode === "light";

  return (
    <>
      {shouldRenderBackdrop && (
        <BackgroundEffect
          width="100%"
          height="200px"
          sx={{
            position: "fixed",
            top: "var(--appshell-header-height, 104px)",
            left: 0,
            transform: "none",
            backgroundColor: "#232B2F",
          }}
        />
      )}

      <Box
        ref={toolbarRef}
        className="AppShell-toolbar"
        sx={{
          position: "fixed",
          top: "var(--appshell-header-height, 104px)",
          left: "var(--appshell-left-offset, 0px)",
          right: 0,
          zIndex: 1002,
          py: 2,
        }}
      >
        <Width>{children}</Width>
      </Box>
    </>
  );
};

export default Toolbar;
