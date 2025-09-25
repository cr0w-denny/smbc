import React from "react";
import { Box } from "@mui/material";

interface WidthProps {
  children: React.ReactNode;
  max?: Record<string, string>;
}

/**
 * Width constraint component that applies consistent responsive width limits.
 * Generic layout utility that can be used across any MUI application.
 */
export const Width: React.FC<WidthProps> = ({
  children,
  max = { xs: "96%", sm: "96%", md: "88%", lg: "88%", xl: "92%" },
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