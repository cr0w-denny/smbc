import { Box, Typography } from "@mui/material";
import { PermissionCard } from "./PermissionCard";
import type { PermissionGroup } from "./types";

interface PermissionsGridProps {
  appletPermissions: PermissionGroup[];
}

export function PermissionsGrid({ appletPermissions }: PermissionsGridProps) {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Permissions by Module
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        {appletPermissions.map((applet) => (
          <PermissionCard key={applet.id} applet={applet} />
        ))}
      </Box>
    </>
  );
}