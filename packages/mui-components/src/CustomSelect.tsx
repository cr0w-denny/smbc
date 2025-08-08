import React from "react";
import {
  Select,
  FormControl,
  InputLabel,
  SelectProps,
  FormControlProps,
  InputLabelProps,
  Box,
} from "@mui/material";
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from "@mui/icons-material";

// Custom dropdown icon component
const CustomDropdownIcon = ({ open }: { open?: boolean }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {open ? (
        <KeyboardArrowUpOutlined sx={{ color: "white", fontSize: 20 }} />
      ) : (
        <KeyboardArrowDownOutlined sx={{ color: "white", fontSize: 20 }} />
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
        <InputLabel {...inputLabelProps} shrink={true}>
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
          "& .MuiSelect-select": {
            paddingRight: "60px !important",
          },
        }}
        label={label}
      >
        {children}
      </Select>
      <CustomDropdownIcon open={open} />
    </FormControl>
  );
};

export default CustomSelect;