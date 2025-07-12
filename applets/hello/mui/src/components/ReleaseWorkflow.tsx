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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

export const ReleaseWorkflow: React.FC = () => {
  const steps = [
    {
      label: "Development",
      description: "Develop features, write tests, and submit for review",
      details: ["Write code and tests", "Run npm test locally", "Create changeset file", "Submit pull request", "Code review and merge"]
    },
    {
      label: "Version Planning",
      description: "Changesets creates version PR with calculated changes",
      details: ["Changesets bot analyzes changes", "Version numbers calculated", "Changelog generated", "Team reviews version PR"]
    },
    {
      label: "Publishing",
      description: "Automated build and publish to registry",
      details: ["Merge version PR", "GitHub Actions builds packages", "Publish to npm registry", "Create Git tags"]
    },
    {
      label: "Integration",
      description: "Test integration and update documentation",
      details: ["Test with Verdaccio locally", "Integration tests in host apps", "Verify compatibility", "Update documentation"]
    }
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Complete release workflow from development to production deployment.
        </Typography>
      </Alert>

      {/* Release Process Flow - Moved to Top */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Release Process
          </Typography>
          
          <Stepper orientation="horizontal" sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label} active={true} completed={false}>
                <StepLabel>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step Details Below */}
          <Grid container spacing={3}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={step.label}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {index + 1}. {step.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  <Stack spacing={0.5}>
                    {step.details.map((detail, i) => (
                      <Typography key={i} variant="body2">
                        • {detail}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Local Testing and Breaking Changes - Two Column Layout */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Local Testing
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Test your packages locally before publishing to npm.
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography
                  component="pre"
                  variant="body2"
                  sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                >
                  {`# Start local registry
npm run verdaccio:start

# Switch to local registry
npm run registry:local

# Publish test version
npm run build
npm run publish:local

# Test in host app
cd /tmp/test-project
npm install @smbc/my-applet@latest`}
                </Typography>
              </Paper>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <Chip label="✅" size="small" sx={{ mr: 1 }} />
                  TypeScript compilation
                </Typography>
                <Typography variant="body2">
                  <Chip label="✅" size="small" sx={{ mr: 1 }} />
                  Unit and integration tests
                </Typography>
                <Typography variant="body2">
                  <Chip label="✅" size="small" sx={{ mr: 1 }} />
                  Bundle size analysis
                </Typography>
                <Typography variant="body2">
                  <Chip label="✅" size="small" sx={{ mr: 1 }} />
                  Security vulnerability scan
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                ⚠️ Breaking Changes
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                When releasing breaking changes, ensure proper communication:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • Document migration steps in CHANGELOG.md
                </Typography>
                <Typography variant="body2">
                  • Update integration examples and documentation
                </Typography>
                <Typography variant="body2">
                  • Notify host application teams in advance
                </Typography>
                <Typography variant="body2">
                  • Consider deprecation warnings in previous version
                </Typography>
                <Typography variant="body2">
                  • Test backward compatibility thoroughly
                </Typography>
                <Typography variant="body2">
                  • Plan rollback strategy if needed
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};