import React from "react";
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type TextProps = MuiTypographyProps;

export const Text: React.FC<TextProps> = ({ sx, ...props }) => {
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
