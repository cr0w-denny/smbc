import React from "react";
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export type TextFieldProps = MuiTextFieldProps;

export const TextField: React.FC<TextFieldProps> = ({ sx, ...props }) => {
  return (
    <MuiTextField
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          fontSize: "0.875rem",
          backgroundColor: ui.input.background,
          "& fieldset": {
            borderColor: ui.input.borderColor,
          },
          "&:hover": {
            backgroundColor: ui.input.on.hover.background,
          },
          "&:hover fieldset": {
            borderColor: ui.input.on.hover.borderColor,
          },
          "&.Mui-focused fieldset": {
            borderColor: ui.input.on.focus.borderColor,
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
          "& .MuiSvgIcon-root": {
            color: ui.input.on.focus.borderColor,
          },
        },
        "& .MuiInputBase-input": {
          padding: "9px 12px",
          color: ui.input.color,
          "&::placeholder": {
            color: ui.input.placeholder,
            opacity: 1,
            fontSize: "1rem",
          },
        },
        "& .MuiInputLabel-root": {
          color: ui.input.color,
          "&.Mui-focused": {
            color: `${ui.input.on.focus.borderColor} !important`,
          },
        },
        transition: "none",
        ...sx,
      }}
      {...props}
    />
  );
};
