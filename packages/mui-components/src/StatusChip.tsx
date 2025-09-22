import React from "react";
import { Chip, ChipProps, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";

export type StatusChipVariant = "default" | "error" | "warning" | "success" | "info" | "custom";

export interface StatusChipProps extends Omit<ChipProps, "variant" | "color"> {
  /** The variant to use */
  variant?: StatusChipVariant;
  /** Custom outline color (for custom variant) */
  outlineColor?: string;
  /** Custom fill color (for custom variant) */
  fillColor?: string;
  /** Text color (defaults based on variant) */
  textColor?: string;
}

// Define color schemes for each variant (light mode)
const variantColors = {
  error: {
    outline: "#CD463C",
    fill: "#FDF9F9",
    text: "#1A1A1A", // Use dark text in light mode for better readability
  },
  warning: {
    outline: "#FD992E",
    fill: "#FFFCFB",
    text: "#1A1A1A",
  },
  success: {
    outline: "#12A187",
    fill: "#FAFDFD",
    text: "#1A1A1A",
  },
  info: {
    outline: "#1976D2",
    fill: "#F0F7FF",
    text: "#1A1A1A",
  },
  default: {
    outline: "#9E9E9E",
    fill: "#FAFAFA",
    text: "#1A1A1A",
  },
  custom: {
    outline: "",
    fill: "",
    text: "",
  },
};

// Dark mode variants with different fills and white text
const darkVariantColors = {
  error: {
    outline: "#CD463C",
    fill: "rgba(205, 70, 60, 0.1)",
    text: "#FFFFFF",
  },
  warning: {
    outline: "#FD992E",
    fill: "rgba(253, 153, 46, 0.1)",
    text: "#FFFFFF",
  },
  success: {
    outline: "#12A187",
    fill: "rgba(18, 161, 135, 0.1)",
    text: "#FFFFFF",
  },
  info: {
    outline: "#1976D2",
    fill: "rgba(25, 118, 210, 0.1)",
    text: "#FFFFFF",
  },
  default: {
    outline: "#9E9E9E",
    fill: "rgba(158, 158, 158, 0.1)",
    text: "#FFFFFF",
  },
  custom: {
    outline: "",
    fill: "",
    text: "",
  },
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) =>
    prop !== "outlineColor" && prop !== "fillColor" && prop !== "textColor",
})<{
  outlineColor?: string;
  fillColor?: string;
  textColor?: string;
}>(({ outlineColor, fillColor, textColor }) => ({
  borderRadius: "16px",
  border: `1px solid ${outlineColor}`,
  backgroundColor: fillColor,
  color: textColor,
  fontSize: "0.875rem",
  fontWeight: 500,
  height: "32px",
  "& .MuiChip-label": {
    padding: "0 12px",
    color: textColor,
  },
  "& .MuiChip-icon": {
    color: outlineColor,
    marginLeft: "8px",
    marginRight: "-4px",
  },
  "&:hover": {
    backgroundColor: fillColor,
    opacity: 0.9,
  },
  // Override MUI's default styles
  "&.MuiChip-outlined": {
    backgroundColor: fillColor,
    border: `1px solid ${outlineColor}`,
  },
  "&.MuiChip-filled": {
    backgroundColor: fillColor,
  },
}));

export const StatusChip: React.FC<StatusChipProps> = ({
  variant = "default",
  outlineColor: customOutlineColor,
  fillColor: customFillColor,
  textColor: customTextColor,
  ...chipProps
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Determine colors based on variant and theme
  const colorSet = isDark ? darkVariantColors : variantColors;
  let colors = colorSet[variant];

  // For custom variant, use provided colors or fallback
  if (variant === "custom") {
    const fallbackColors = isDark ? darkVariantColors.default : variantColors.default;
    colors = {
      outline: customOutlineColor || fallbackColors.outline,
      fill: customFillColor || fallbackColors.fill,
      text: customTextColor || customOutlineColor || fallbackColors.text,
    };
  }

  // Allow override of colors even for standard variants
  const finalColors = {
    outline: customOutlineColor || colors.outline,
    fill: customFillColor || colors.fill,
    text: customTextColor || colors.text,
  };

  return (
    <StyledChip
      {...chipProps}
      outlineColor={finalColors.outline}
      fillColor={finalColors.fill}
      textColor={finalColors.text}
    />
  );
};