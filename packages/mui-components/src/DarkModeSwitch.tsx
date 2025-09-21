import React from "react";
import { Switch, Typography, useTheme, Box } from "@mui/material";

export interface DarkModeSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export const DarkModeSwitch: React.FC<DarkModeSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  showLabel = true,
}) => {
  const theme = useTheme();

  const switchComponent = (
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      sx={{
        width: 68,
        height: 50,
        padding: 0,
        marginTop: "2px",
        overflow: "visible",
        "& .MuiSwitch-switchBase": {
          padding: 0,
          margin: "2px",
          marginTop: "-2px",
          marginLeft: "-2px",
          transitionDuration: "300ms",
          "&.Mui-checked": {
            transform: "translateX(38px)",
            color: "#fff",
            "& .MuiSwitch-thumb": {
              background:
                "linear-gradient(39.72deg, #2078E1 3.84%, #4CB487 96.16%)",
              border: "1px solid #24324C33",
              boxShadow: "0px 4px 4px 0px #00000040",
              "&::before": {
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M6 0.278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z'/%3E%3C/svg%3E") center/14px no-repeat`,
              },
            },
            "& + .MuiSwitch-track": {
              background:
                "linear-gradient(90.13deg, rgba(2, 79, 176, 0.14) 0.11%, rgba(44, 136, 243, 0.14) 99.89%)",
            },
          },
        },
        "& .MuiSwitch-thumb": {
          background:
            "linear-gradient(227.38deg, #053636 1.91%, #4FA47F 98.09%)",
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 4px 0 rgba(0,35,11,0.2)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            borderRadius: "50%",
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='3' fill='white'/%3E%3Cpath d='M12 0.5v3.5M12 20v3.5M3.7 3.7l2.6 2.6M17.7 17.7l2.6 2.6M0.5 12h3.5M20 12h3.5M3.7 20.3l2.6-2.6M17.7 6.3l2.6-2.6' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") center/18px no-repeat`,
          },
        },
        "& .MuiSwitch-track": {
          height: 30,
          borderRadius: 15,
          background:
            "linear-gradient(90.13deg, #0F1727 0.11%, #101829 99.89%)",
          border: "1px solid #465777",
          opacity: 1,
          transition: theme.transitions.create(["background-color"], {
            duration: 500,
          }),
        },
      }}
    />
  );

  if (!showLabel) {
    return switchComponent;
  }

  const label = checked ? "Dark Mode" : "Light Mode";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "-18px" }}>
      {switchComponent}
      <Typography sx={{ fontWeight: 500, mt: "-18px" }}>{label}</Typography>
    </Box>
  );
};

export default DarkModeSwitch;
