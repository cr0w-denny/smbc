import React from "react";
import { Box } from "@mui/material";
import { layout } from "@smbc/ui-core";

interface WidthProps {
  children: React.ReactNode;
  max?: Record<string, string>;
}

/**
 * Width constraint component that applies consistent responsive width limits.
 */
export const Width: React.FC<WidthProps> = ({
  children,
  max = {
    xs: layout.maxWidth.xs(),
    sm: layout.maxWidth.sm(),
    md: layout.maxWidth.md(),
    lg: layout.maxWidth.lg(),
    xl: layout.maxWidth.xl(),
  },
}) => (
  <Box
    sx={{
      maxWidth: max,
      margin: "0 auto",
      width: "100%",
      height: "100%",
    }}
  >
    {children}
  </Box>
);

export default Width;
