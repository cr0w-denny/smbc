import React from "react";
import { Box } from "@mui/material";

interface WidthProps {
  children: React.ReactNode;
  max?: Record<string, string>;
}

/**
 * Width constraint component that applies consistent responsive width limits.
 *
 * CSS Variables:
 * - `--width-max`: Override to ignore responsive breakpoints (e.g., "100%")
 * - Falls back to `--layout-maxWidth-*` tokens from ui-core
 */
export const Width: React.FC<WidthProps> = ({ children }) => (
  <Box
    sx={{
      width: "100%",
      maxWidth: {
        xs: "var(--width-max, var(--layout-maxWidth-xs))",
        sm: "var(--width-max, var(--layout-maxWidth-sm))",
        md: "var(--width-max, var(--layout-maxWidth-md))",
        lg: "var(--width-max, var(--layout-maxWidth-lg))",
        xl: "var(--width-max, var(--layout-maxWidth-xl))",
      },
      margin: "0 auto",
      height: "100%",
    }}
  >
    {children}
  </Box>
);

export default Width;
