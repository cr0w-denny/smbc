import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  GridLegacy as Grid,
  Divider,
} from "@mui/material";

export const VersioningStrategy: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography
                variant="h1"
                sx={{ fontSize: "3rem", mb: 2, color: "success.main" }}
              >
                🔧
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                PATCH
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
                1.0.X
              </Typography>
              <Typography variant="body2">
                Bug fixes and minor updates that don't break existing
                functionality.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography
                variant="h1"
                sx={{ fontSize: "3rem", mb: 2, color: "warning.main" }}
              >
                ✨
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                MINOR
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, color: "warning.main" }}>
                1.X.0
              </Typography>
              <Typography variant="body2">
                New features and enhancements that maintain backward
                compatibility.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography
                variant="h1"
                sx={{ fontSize: "3rem", mb: 2, color: "error.main" }}
              >
                💥
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                MAJOR
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
                X.0.0
              </Typography>
              <Typography variant="body2">
                Breaking changes that require host applications to update their
                integration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Changesets Workflow
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We use Changesets to manage versioning and releases across the
            monorepo.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Development Flow
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  1. Make changes to applet code
                </Typography>
                <Typography variant="body2">
                  2. Run <code>npm run changeset</code>
                </Typography>
                <Typography variant="body2">
                  3. Describe the changes and impact
                </Typography>
                <Typography variant="body2">
                  4. Commit changeset file with your PR
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Release Flow
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  1. Changesets creates version PR
                </Typography>
                <Typography variant="body2">
                  2. Review and merge version PR
                </Typography>
                <Typography variant="body2">
                  3. GitHub Actions publishes to npm
                </Typography>
                <Typography variant="body2">
                  4. Updates are available for integration
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper
        sx={{
          p: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "grey.50",
          border: (theme) =>
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "none",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Package Structure
        </Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "white",
            color: (theme) =>
              theme.palette.mode === "dark" ? "grey.100" : "grey.900",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.85rem",
          }}
        >
          {`# Applet packages are versioned together
@smbc/user-management-api     # API types and client
@smbc/user-management-mui     # React components
@smbc/user-management-core    # Business logic

# Core packages have independent versioning
@smbc/applet-core            # Framework utilities
@smbc/mui-applet-core        # MUI-specific components
@smbc/mui-components         # Shared UI components

# All applet packages in a group share the same version
# This ensures compatibility between API, UI, and logic`}
        </Typography>
      </Paper>
    </Box>
  );
};
