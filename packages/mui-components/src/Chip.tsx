import React from "react";
import { Chip as MuiChip, ChipProps as MuiChipProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type ChipProps = MuiChipProps;

export const Chip: React.FC<ChipProps> = ({ sx, color = "default", ...props }) => {
  return (
    <MuiChip
      color={color}
      sx={{
        borderRadius: 3,
        fontSize: "0.75rem",
        height: 24,
        color: color === "primary" ? ui.chip.color : ui.chip.classes.default.color,
        transition: "none",
        ...sx,
      }}
      {...props}
    />
  );
};
