import { Box, Typography, Chip, Card, CardContent } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import type { User } from "./types";

interface CurrentUserInfoProps {
  user: User;
  selectedRoles: string[];
  show: boolean;
}

export function CurrentUserInfo({
  user,
  selectedRoles,
  show,
}: CurrentUserInfoProps) {
  if (!show || !user) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Current User
          </Typography>
          {user.name && (
            <Typography>
              <strong>Name:</strong> {user.name}
            </Typography>
          )}
          {user.email && (
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <strong>Active Roles:</strong>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
            >
              {selectedRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}