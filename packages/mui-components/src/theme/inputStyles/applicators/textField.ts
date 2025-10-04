import type { Theme } from "@mui/material/styles";
import type { InputStyleSpec } from "../types";

/**
 * Applies InputStyleSpec to MUI TextField component overrides
 */
export function applyTextFieldStyles(styles: InputStyleSpec, theme: Theme) {
  return {
    root: {
      "#app &": {
        "& .MuiOutlinedInput-root": {
          ...styles.background?.base,
          ...styles.border?.base,
          "&:hover": {
            ...styles.background?.hover,
            "& fieldset": styles.border?.hover,
          },
          "&.Mui-focused": {
            ...styles.background?.focus,
            "& fieldset": styles.border?.focus,
          },
          "&.Mui-disabled": {
            ...styles.background?.disabled,
            "& fieldset": styles.border?.disabled,
          },
          "& fieldset": styles.border?.base,
          "&:hover fieldset": styles.border?.hover,
          "&.Mui-focused fieldset": styles.border?.focus,
          "&.Mui-disabled fieldset": styles.border?.disabled,
        },

        "& .MuiInputBase-input": {
          ...styles.text?.base,
          fontSize: "0.875rem",
          padding: "9px 12px",
        },

        "& .MuiInputLabel-root": {
          ...styles.label?.base,
          "&.Mui-focused": styles.label?.focus,
          "&.Mui-disabled": styles.label?.disabled,
        },

        "& .MuiSvgIcon-root": {
          ...styles.icon?.base,
        },
      },
    },
  };
}

/**
 * Applies InputStyleSpec to MUI date picker components
 */
export function applyDatePickerStyles(styles: InputStyleSpec, theme: Theme) {
  return {
    root: {
      "#app &": {
        ...styles.background?.base,
        ...styles.border?.base,
        "&.Mui-focused": {
          ...styles.background?.focus,
        },
        "&.Mui-disabled": {
          ...styles.background?.disabled,
        },
      },
    },
  };
}
