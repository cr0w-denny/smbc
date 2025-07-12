import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Paper,
  Alert,
  GridLegacy as Grid,
} from "@mui/material";

export const DeveloperExperience: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Developer experience and tools for building applets efficiently.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Development Environment
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Complete toolkit for applet development with hot reloading and instant feedback.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1, mb: 2 }}
              >
                <Chip label="Hot Reload" size="small" variant="outlined" />
                <Chip label="TypeScript" size="small" variant="outlined" />
                <Chip label="Vite Build" size="small" variant="outlined" />
                <Chip label="ESLint" size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Start developing immediately with npm run dev and see changes instantly.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Mock Service Worker
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Develop against realistic APIs without backend dependencies.
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Auto-generated:</strong> Mocks from TypeSpec schemas
                </Typography>
                <Typography variant="body2">
                  <strong>Realistic data:</strong> Faker.js integration
                </Typography>
                <Typography variant="body2">
                  <strong>Toggle-able:</strong> Switch between mock and real APIs
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Testing Framework
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Comprehensive testing with Vitest and Testing Library.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1, mb: 2 }}
              >
                <Chip label="Vitest" size="small" variant="outlined" />
                <Chip label="React Testing Library" size="small" variant="outlined" />
                <Chip label="Coverage Reports" size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Unit tests, integration tests, and component testing built-in.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Component Library
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Pre-built components for common applet patterns.
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>DataView:</strong> Tables with filtering, pagination
                </Typography>
                <Typography variant="body2">
                  <strong>AutoFilter:</strong> Generate UI from API schemas
                </Typography>
                <Typography variant="body2">
                  <strong>Forms:</strong> Auto-generated from TypeScript types
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Quick Start
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
            fontSize: "0.85rem",
          }}
        >
          {`# Create a new applet
npm create @smbc/applet my-applet

# Start development server
cd my-applet
npm run dev

# Generate API client from TypeSpec
npm run generate-api

# Run tests
npm test

# Build for production
npm run build`}
        </Typography>
      </Paper>
    </Box>
  );
};