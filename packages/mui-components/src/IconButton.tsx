import React from "react";
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from "@mui/material";

export type IconButtonProps = MuiIconButtonProps;

export const IconButton: React.FC<IconButtonProps> = ({ sx, ...props }) => {
  return (
    <MuiIconButton
      sx={{
        borderRadius: 8,
        padding: 8,
        color: "#98A4B9",
        transition: "none",
        ...sx,
      }}
      {...props}
    />
  );
};
