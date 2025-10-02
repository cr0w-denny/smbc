import React from "react";
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type TooltipProps = MuiTooltipProps;

export const Tooltip: React.FC<TooltipProps> = ({ componentsProps, ...props }) => {
  return (
    <MuiTooltip
      componentsProps={{
        ...componentsProps,
        tooltip: {
          ...componentsProps?.tooltip,
          sx: {
            backgroundColor: ui.tooltip.background,
            color: ui.tooltip.color,
            fontSize: "0.75rem",
            borderRadius: 6,
            boxShadow: ui.tooltip.boxShadow,
            ...componentsProps?.tooltip?.sx,
          },
        },
      }}
      {...props}
    />
  );
};
