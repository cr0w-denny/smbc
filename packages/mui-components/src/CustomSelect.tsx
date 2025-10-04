import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  SelectProps,
  FormControlProps,
  InputLabelProps,
  Box,
  useTheme,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useConfig } from "./ConfigContext";
import {
  customSelectLight,
  customSelectDark,
  customSelectToolbarDark,
} from "./theme/inputStyles";

const CustomDropdownIcon = ({
  open,
  iconColor,
}: {
  open?: boolean;
  iconColor?: string;
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 15,
        top: "50%",
        transform: "translateY(-50%)",
        width: 24,
        height: 24,
        borderRadius: 12,
        border: "2px solid",
        borderColor: iconColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        color: iconColor,
      }}
    >
      {open ? (
        <ExpandLess sx={{ fontSize: 20, color: "inherit" }} />
      ) : (
        <ExpandMore sx={{ fontSize: 20, color: "inherit" }} />
      )}
    </Box>
  );
};

export interface CustomSelectProps extends Omit<SelectProps, "children"> {
  /** Label for the select field */
  label?: string;
  /** Label positioning mode - 'contain' keeps label within border, 'overlap' allows floating label to overlap border */
  labelMode?: "contain" | "overlap";
  /** Props to pass to FormControl */
  formControlProps?: FormControlProps;
  /** Props to pass to InputLabel */
  inputLabelProps?: InputLabelProps;
  /** Children elements (MenuItem components) */
  children?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  labelMode,
  formControlProps,
  inputLabelProps,
  children,
  ...selectProps
}) => {
  const [open, setOpen] = React.useState(false);
  const { form, toolbar } = useConfig();
  const theme = useTheme();

  // Priority: prop > context > default
  const effectiveLabelMode = labelMode ?? form?.labelMode ?? "contain";
  const isDarkToolbar = toolbar?.mode === "dark";
  const isDarkMode = theme.palette.mode === "dark";

  // Select the appropriate styles based on mode
  const styles = isDarkMode
    ? customSelectDark
    : isDarkToolbar
      ? customSelectToolbarDark
      : customSelectLight;

  // Get icon color (use focus state when open, base when closed)
  const iconStyles: any = open ? styles.icon?.focus : styles.icon?.base;
  const iconColor = iconStyles?.color as string | undefined;

  const sxMenu = {
    ...selectProps.MenuProps?.sx,
    "& .MuiPaper-root": {
      ...styles.menu?.border,
      ...styles.menu?.background,
    },
    "& .MuiMenuItem-root": {
      ...styles.menu?.item?.base,
      "&:hover": {
        ...styles.menu?.item?.hover,
      },
      "&.Mui-selected": {
        ...styles.menu?.item?.selected,
        "&:hover": {
          ...styles.menu?.item?.hover,
        },
      },
      "&.Mui-focusVisible": {
        ...styles.menu?.item?.focus,
      },
    },
  };

  const sxSelect = {
    ...selectProps.sx,
    ...(effectiveLabelMode === "contain" ? { height: "57px" } : {}),
    ...styles.background?.base,
    ...styles.text?.base,
    "& .MuiOutlinedInput-notchedOutline": {
      ...styles.border?.base,
    },
    "&:hover": {
      ...styles.background?.hover,
    },
    "&.Mui-focused": {
      ...styles.background?.focus,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      ...styles.border?.focus,
    },
    "& .MuiSelect-select": {
      ...(effectiveLabelMode === "contain"
        ? {
            padding: "26px 20px 10px 12px",
            paddingRight: "50px !important",
            fontSize: "15px",
            minHeight: "21px",
            lineHeight: 1.2,
            height: "55px",
            boxSizing: "border-box" as const,
            display: "flex",
            alignItems: "flex-start" as const,
            justifyContent: "flex-start" as const,
          }
        : {}),
    },
  };

  return (
    <FormControl
      {...formControlProps}
      sx={{
        ...formControlProps?.sx,
        position: "relative",
      }}
    >
      {label && (
        <InputLabel
          {...inputLabelProps}
          shrink={true}
          sx={{
            ...inputLabelProps?.sx,
            ...(effectiveLabelMode === "contain"
              ? {
                  position: "absolute" as const,
                  top: "8px",
                  left: "20px",
                  fontSize: "12px !important",
                  zIndex: 2,
                  pointerEvents: "none" as const,
                  transform: "none",
                }
              : {}),
            "#app &": {
              color: open ? (styles.label?.focus as any)?.color : (styles.label?.base as any)?.color,
            },
            "#app &.Mui-focused": {
              color: (styles.label?.focus as any)?.color,
            },
          }}
        >
          {label}
        </InputLabel>
      )}
      <Select
        {...selectProps}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        IconComponent={() => null}
        MenuProps={{
          ...selectProps.MenuProps,
          sx: sxMenu as any,
        }}
        sx={sxSelect as any}
        label={effectiveLabelMode === "overlap" ? label : undefined}
      >
        {children}
      </Select>
      <CustomDropdownIcon open={open} iconColor={iconColor} />
    </FormControl>
  );
};

export default CustomSelect;
