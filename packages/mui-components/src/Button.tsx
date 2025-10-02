import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material";
import { ui, color } from "@smbc/ui-core";

export type ButtonProps = MuiButtonProps;

export const Button: React.FC<ButtonProps> = ({
  sx,
  variant = "contained",
  ...props
}) => {
  const baseStyles = {
    background: variant === "contained" ? color.gradient.primaryBlue : undefined,
    borderRadius: ui.button.borderRadius,
    color: variant === "contained" ? ui.button.color : undefined,
    fontSize: "17px",
    fontWeight: 500,
    height: "40px",
    letterSpacing: "0.2px",
    textTransform: "none" as const,
    transition: "none",
    "&.Mui-disabled": {
      opacity: 0.8,
      filter: "brightness(50%)",
    },
  };

  return (
    <MuiButton
      variant={variant}
      sx={{
        ...baseStyles,
        ...sx,
      }}
      {...props}
    />
  );
};
