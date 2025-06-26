import { Box, Typography, ToggleButton } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";

interface DashboardHeaderProps {
  title: string;
  availableRoles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
}

export function DashboardHeader({
  title,
  availableRoles,
  selectedRoles,
  onRoleToggle,
}: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h4">
        <SecurityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Roles:</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {availableRoles.map((role) => (
            <ToggleButton
              key={role}
              value={role}
              selected={selectedRoles.includes(role)}
              onChange={() => onRoleToggle(role)}
              size="small"
              sx={{ textTransform: "none" }}
            >
              {role}
            </ToggleButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
}