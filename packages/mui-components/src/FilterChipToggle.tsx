import React from "react";
import { Box, Chip } from "@mui/material";

// Color calculation utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const hexToRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface FilterChip {
  value: string;
  label: string;
  icon?: React.ReactElement;
  count?: number;
  color?: string; // Base color - defaults to theme primary
  disabled?: boolean;
  group?: string;
}

export interface FilterChipToggleProps {
  chips: FilterChip[];
  activeValues: string[];
  onChipToggle: (value: string, isActive: boolean) => void;
  sx?: any;
}

export const FilterChipToggle: React.FC<FilterChipToggleProps> = ({
  chips,
  activeValues,
  onChipToggle,
  sx,
}) => {
  const createChipSx = (
    chip: FilterChip,
    isActive: boolean,
    shadowColor: string,
  ) => {
    const baseColor = chip.color || "#1976D2"; // Default to theme primary

    return (theme: any) => ({
      cursor: "pointer",
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.background.paper
          : "#FFFFFF",
      border: "none",
      outline: isActive ? `3px solid ${baseColor}` : "none",
      borderRadius: "23px", // 46px height / 2 for full rounded
      minWidth: "158px",
      maxWidth: "186px",
      height: "46px",
      padding: "0 12px",
      fontSize: "13px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      boxShadow: `0 0 1px 3px ${shadowColor}`,
      "&:hover": {
        outline: isActive ? `3px solid ${baseColor}` : `1px solid ${baseColor}`,
        boxShadow: `0 0 1px 3px ${shadowColor}`,
      },
      "&.MuiChip-clickable:hover": {},
      "& .MuiChip-label": {
        padding: 0,
        display: "flex",
        alignItems: "center",
        width: "100%",
        overflow: "visible",
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        alignItems: "center",
        ...sx,
      }}
    >
      {chips.map((chip) => {
        const isActive = activeValues.includes(chip.value);
        const baseColor = chip.color || "#1976D2";
        const shadowColor = hexToRgba(baseColor, 0.3);

        return (
          <Chip
            key={chip.value}
            variant="outlined"
            size="medium"
            clickable
            disabled={chip.disabled}
            onClick={() => {
              const newActiveState = !isActive;

              // If this chip has a group and is being activated
              if (chip.group && newActiveState) {
                // Find all other chips in the same group
                const sameGroupChips = chips
                  .filter(
                    (c) => c.group === chip.group && c.value !== chip.value,
                  )
                  .map((c) => c.value);

                // Call toggle for each chip in the same group to deactivate them
                sameGroupChips.forEach((chipValue) => {
                  if (activeValues.includes(chipValue)) {
                    onChipToggle(chipValue, false);
                  }
                });
              }

              onChipToggle(chip.value, newActiveState);
            }}
            sx={createChipSx(chip, isActive, shadowColor)}
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                }}
              >
                {/* Left: Icon */}
                {chip.icon && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(chip.icon, {
                      sx: {
                        fontSize: "18px",
                        width: "18px",
                        height: "18px",
                        color: isActive ? "#FFFFFF" : baseColor,
                        filter: isActive
                          ? `drop-shadow(0 0 4px ${baseColor}) drop-shadow(0 0 8px ${baseColor})`
                          : `drop-shadow(0 0 8px ${baseColor})`,
                      },
                    })}
                  </Box>
                )}

                {/* Center: Label */}
                <Box
                  sx={(theme: any) => ({
                    flex: 1,
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: isActive
                      ? "#FFFFFF"
                      : theme.palette.mode === "dark"
                      ? theme.palette.text.primary
                      : "#1A1A1A",
                  })}
                >
                  {chip.label}
                </Box>

                {/* Right: Count badge */}
                {chip.count !== undefined && (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: baseColor,
                      color: "#FFFFFF",
                      borderRadius: "50%",
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {chip.count}
                  </Box>
                )}
              </Box>
            }
          />
        );
      })}
    </Box>
  );
};
