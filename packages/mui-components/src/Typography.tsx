import React from "react";
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type TypographyProps = MuiTypographyProps;

export const Typography: React.FC<TypographyProps> = ({ sx, ...props }) => {
  return (
    <MuiTypography
      sx={{
        color: ui.color.text.primary,
        ...sx,
      }}
      {...props}
    />
  );
};
