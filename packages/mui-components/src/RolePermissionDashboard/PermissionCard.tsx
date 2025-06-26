import { Box, Typography, Card, CardContent } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { PermissionChip } from "./PermissionChip";
import type { PermissionGroup } from "./types";

interface PermissionCardProps {
  applet: PermissionGroup;
}

export function PermissionCard({ applet }: PermissionCardProps) {
  const IconComponent = applet.icon || PersonIcon;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
      }}
    >
      <CardContent
        sx={{
          pb: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontSize: "0.95rem",
            fontWeight: 600,
            mb: 2,
            minHeight: "1.5em",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconComponent
            sx={{
              mr: 0.5,
              fontSize: "1.2rem",
            }}
          />
          {applet.label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            flexGrow: 1,
          }}
        >
          {applet.permissions.map((permission) => (
            <PermissionChip key={permission.key} permission={permission} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
