import React from "react";
import {
  Box,
  Typography,
  GridLegacy as Grid,
} from "@mui/material";

export const WhatIsAnApplet: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="body1"
        sx={{ mb: 4, maxWidth: "800px", lineHeight: 1.6 }}
      >
        Applets are self-contained applications that can be embedded into any
        host system. Each one focuses on a specific business function and
        exports a standardized interface, making them interchangeable and easy
        to integrate.
      </Typography>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Core Characteristics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              backgroundColor: "action.hover",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              📦 Self-Contained
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Has everything it needs built-in. Drop it in and go without
              worrying about dependencies.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              backgroundColor: "action.hover",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              🔌 Plugs In Anywhere
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Can be embedded into any website or application. Install a few
              packages and you're done.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              backgroundColor: "action.hover",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              🎯 Does One Thing Well
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Focused on solving a specific problem. Like a calculator app just
              does math, not email.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Architecture Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Standard Interface
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Every applet exports the same interface structure:
            </Typography>
            <Typography
              component="div"
              variant="body2"
              sx={{ lineHeight: 1.7 }}
            >
              • <strong>Component:</strong> React component with mount path
              <br />• <strong>Permissions:</strong> Role-based access
              definitions
              <br />• <strong>Navigation:</strong> Routes and menu structure
              <br />• <strong>API Spec:</strong> OpenAPI specification
              (optional)
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Permission-Based Access
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Security is built into the applet architecture:
            </Typography>
            <Typography
              component="div"
              variant="body2"
              sx={{ lineHeight: 1.7 }}
            >
              • <strong>Route Protection:</strong> Each route requires specific
              permissions
              <br />• <strong>Role Mapping:</strong> Flexible role-to-permission
              assignments
              <br />• <strong>Dynamic Menus:</strong> Navigation adapts to user
              permissions
              <br />• <strong>API Integration:</strong> Backend services respect
              the same security model
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Hash-Based Navigation
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Navigation uses URL hashes for state management:
            </Typography>
            <Typography
              component="div"
              variant="body2"
              sx={{ lineHeight: 1.7 }}
            >
              • <strong>Deep Linking:</strong> Every state is bookmarkable and
              shareable
              <br />• <strong>Browser Integration:</strong> Back/forward buttons
              work naturally
              <br />• <strong>State Persistence:</strong> Filters and pagination
              survive page refreshes
              <br />• <strong>Applet Isolation:</strong> Each applet manages its
              own routing
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              API-First Design
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Data contracts are defined before implementation:
            </Typography>
            <Typography
              component="div"
              variant="body2"
              sx={{ lineHeight: 1.7 }}
            >
              • <strong>TypeSpec Definitions:</strong> API specifications
              written in TypeSpec
              <br />• <strong>Generated Types:</strong> Automatic TypeScript
              type generation
              <br />• <strong>Mock Data:</strong> Frontend development with
              generated mock services
              <br />• <strong>OpenAPI Output:</strong> Standard API
              documentation and tooling
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
