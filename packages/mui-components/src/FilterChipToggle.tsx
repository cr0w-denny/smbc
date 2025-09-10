import React from "react";
import { Box, Chip } from "@mui/material";

export interface FilterChip {
  value: string;
  label: string;
  icon?: React.ReactElement;
  count?: number;
  style?: {
    border?: string;
    badge?: string;
    fill?: string;
  };
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
  const createChipSx = (chip: FilterChip, isActive: boolean) => {
    const colors = chip.style || { border: "#666", badge: "#666", fill: "#FAFDFD" };
    
    return (theme: any) => ({
      cursor: "pointer",
      backgroundColor: isActive
        ? colors.badge
        : theme.palette.mode === "dark"
        ? theme.palette.background.paper
        : "#FFFFFF",
      border: `1px solid ${colors.border}`,
      borderRadius: "20px",
      [theme.breakpoints.up("lg")]: {
        minWidth: "187px",
      },
      height: "auto",
      padding: "8px 12px",
      fontSize: "14px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      transition: "none !important",
      "&:hover": {
        backgroundColor: `${
          isActive
            ? colors.badge
            : theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#FFFFFF"
        } !important`,
        transform: "translateY(-1px)",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
      },
      "&.MuiChip-clickable:hover": {
        backgroundColor: `${
          isActive
            ? colors.badge
            : theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#FFFFFF"
        } !important`,
      },
      "& .MuiChip-label": {
        padding: 0,
        display: "flex",
        alignItems: "center",
        width: "100%",
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
        const colors = chip.style || { border: "#666", badge: "#666" };

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
                  .filter(c => c.group === chip.group && c.value !== chip.value)
                  .map(c => c.value);
                
                // Call toggle for each chip in the same group to deactivate them
                sameGroupChips.forEach(chipValue => {
                  if (activeValues.includes(chipValue)) {
                    onChipToggle(chipValue, false);
                  }
                });
              }
              
              onChipToggle(chip.value, newActiveState);
            }}
            sx={createChipSx(chip, isActive)}
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
                    sx={(theme: any) => ({
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: isActive
                        ? "#FFFFFF"
                        : theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#F0F0F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    })}
                  >
                    {React.cloneElement(chip.icon, {
                      sx: {
                        fontSize: "18px",
                        width: "18px",
                        height: "18px",
                        color: isActive ? colors.badge : colors.badge,
                      },
                    })}
                  </Box>
                )}

                {/* Center: Label */}
                <Box
                  sx={(theme: any) => ({
                    flex: 1,
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: isActive
                      ? "#FFFFFF"
                      : theme.palette.mode === "dark"
                      ? theme.palette.text.primary
                      : "#1A1A1A",
                    [theme.breakpoints.up("lg")]: { fontSize: "14px" },
                  })}
                >
                  {chip.label}
                </Box>

                {/* Right: Count badge */}
                {chip.count !== undefined && (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: isActive ? "#FFFFFF" : colors.badge,
                      color: isActive ? colors.badge : "#FFFFFF",
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