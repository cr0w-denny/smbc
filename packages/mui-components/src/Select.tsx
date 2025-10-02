import React from "react";
import { Select as MuiSelect, SelectProps as MuiSelectProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type SelectProps = MuiSelectProps;

export const Select: React.FC<SelectProps> = ({ sx, ...props }) => {
  return (
    <MuiSelect
      sx={{
        borderRadius: 3,
        backgroundColor: ui.input.background,
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: 3,
          borderColor: ui.input.borderColor,
        },
        "&:hover": {
          backgroundColor: ui.input.on.hover.background,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: ui.input.on.hover.borderColor,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: ui.input.on.focus.borderColor,
          borderWidth: 2,
        },
        "&.Mui-focused": {
          backgroundColor: ui.input.on.focus.background,
        },
        "& .MuiSvgIcon-root": {
          color: ui.input.on.focus.borderColor,
        },
        transition: "none",
        ...sx,
      }}
      {...props}
    />
  );
};
