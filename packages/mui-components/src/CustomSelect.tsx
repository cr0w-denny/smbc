import React from "react";
import {
  FormControl,
  InputLabel,
  SelectProps,
  FormControlProps,
  InputLabelProps,
  Box,
} from "@mui/material";
import { Select } from "./Select";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ui } from "@smbc/ui-core";

const CustomDropdownIcon = ({ open }: { open?: boolean }) => {
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
        borderColor: ui.color.action,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {open ? (
        <ExpandLess sx={{ fontSize: 20 }} />
      ) : (
        <ExpandMore sx={{ fontSize: 20 }} />
      )}
    </Box>
  );
};

export interface CustomSelectProps extends Omit<SelectProps, "children"> {
  /** Label for the select field */
  label?: string;
  /** Props to pass to FormControl */
  formControlProps?: FormControlProps;
  /** Props to pass to InputLabel */
  inputLabelProps?: InputLabelProps;
  /** Children elements (MenuItem components) */
  children?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  formControlProps,
  inputLabelProps,
  children,
  ...selectProps
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <FormControl
      {...formControlProps}
      sx={{ ...formControlProps?.sx, position: "relative" }}
    >
      {label && (
        <InputLabel
          {...inputLabelProps}
          shrink={true}
          sx={{
            ...inputLabelProps?.sx,
            position: "absolute",
            top: "8px",
            left: "20px",
            fontSize: "12px !important",
            zIndex: 2,
            pointerEvents: "none",
            transform: "none",
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
        sx={{
          ...selectProps.sx,
          height: "57px",
          "& .MuiSelect-select": {
            padding: "26px 20px 10px 12px",
            paddingRight: "50px !important",
            fontSize: "15px",
            minHeight: "21px",
            lineHeight: 1.2,
            height: "55px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          },
        }}
        label={undefined}
      >
        {children}
      </Select>
      <CustomDropdownIcon open={open} />
    </FormControl>
  );
};

export default CustomSelect;
