import React from "react";
import { Box } from "@mui/material";

export interface PageProps {
  children: React.ReactNode;
}

/**
 * Page container that provides a standard flex column layout.
 */
export const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <Box
      className="AppShell-page"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
};

export default Page;
