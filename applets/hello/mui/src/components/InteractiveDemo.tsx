import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Paper,
  Alert,
} from "@mui/material";
import { useHashParams } from "@smbc/applet-core";

export const InteractiveDemo: React.FC = () => {
  // This demonstrates how applets can save state in the URL
  const { filters, setFilters } = useHashParams({
    name: "",
    color: "blue",
    notifications: true,
  });

  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Change the settings below and notice how the URL updates. Refresh the
          page to see your settings persist.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Settings That Save in URL
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Your Name"
              value={filters.name}
              onChange={(e) => setFilters({ name: e.target.value })}
              placeholder="Enter your name..."
              fullWidth
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Favorite Color:
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1 }}
              >
                {["blue", "green", "red", "purple", "orange"].map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    onClick={() => setFilters({ color })}
                    variant={filters.color === color ? "filled" : "outlined"}
                    color={filters.color === color ? "primary" : "default"}
                    sx={{ textTransform: "capitalize" }}
                  />
                ))}
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.notifications}
                  onChange={(e) =>
                    setFilters({ notifications: e.target.checked })
                  }
                />
              }
              label="Enable Notifications"
            />

            {filters.name && (
              <Paper sx={{ 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "success.dark" : "success.50",
                color: (theme) => theme.palette.mode === "dark" ? "success.100" : "success.800"
              }}>
                <Typography variant="h6">Hello, {filters.name}!</Typography>
                <Typography variant="body2">
                  Your favorite color is <strong>{filters.color}</strong> and
                  you have notifications{" "}
                  <strong>
                    {filters.notifications ? "enabled" : "disabled"}
                  </strong>
                  .
                </Typography>
              </Paper>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current State
        </Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "white",
            color: (theme) => theme.palette.mode === "dark" ? "grey.100" : "grey.900",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          {`Settings from URL: {
  name: "${filters.name}"
  color: "${filters.color}"
  notifications: ${filters.notifications}
}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          This state is automatically synchronized with the URL and persists
          across page refreshes.
        </Typography>
      </Paper>
    </Box>
  );
};
