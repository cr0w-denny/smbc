import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { ui, color } from "@smbc/ui-core";

export type ButtonProps = Omit<MuiButtonProps, "color">;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ sx, variant = "contained", ...props }, ref) => {
    const baseStyles = {
      background:
        variant === "contained" ? color.gradient.primaryBlue : undefined,
      color: variant === "contained" ? "#FFFFFF" : undefined,
      borderRadius: ui.button.borderRadius,
      fontSize: "17px",
      fontWeight: 500,
      height: "40px",
      letterSpacing: "0.2px",
      textTransform: "none" as const,
      transition: "none",
      "&.MuiButtonBase-root.MuiButton-root.Mui-disabled": {
        color: "rgba(255, 255, 255, 0.8)",
        opacity: "0.5",
      },
    };

    return (
      <MuiButton
        ref={ref}
        variant={variant}
        sx={{
          ...baseStyles,
          ...sx,
        }}
        {...props}
      />
    );
  },
);
