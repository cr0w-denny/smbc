import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  SelectProps,
  FormControlProps,
  InputLabelProps,
  Box,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ui } from "@smbc/ui-core";
import { useFormField } from "./FormFieldContext";

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
  const { labelMode: contextLabelMode } = useFormField();

  // Priority: prop > context > default
  const effectiveLabelMode = labelMode ?? contextLabelMode ?? "contain";

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
          ...(effectiveLabelMode === "contain" ? { height: "57px" } : {}),
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
