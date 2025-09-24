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
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ui } from "@smbc/ui-core";
import { t } from "./utils/tokens";

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
        borderColor: t(ui.color.input.active),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {open ? (
        <ExpandLess
          sx={{ color: t(ui.color.input.active), fontSize: 20 }}
        />
      ) : (
        <ExpandMore
          sx={{ color: t(ui.color.input.active), fontSize: 20 }}
        />
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
            color: (theme) =>
              `${t(ui.color.input.active)(theme)} !important`,
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
          backgroundColor: t(ui.color.input.background),
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
            color: t(ui.color.input.value),
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: t(ui.color.input.border),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: t(ui.color.input.active),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: t(ui.color.input.active),
          },
          "&.Mui-focused": {
            backgroundColor: t(ui.color.input.hover),
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
