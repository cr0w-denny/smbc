import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  GridLegacy as Grid,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { CodeHighlight } from "../CodeHighlight";

export const ReleaseWorkflow: React.FC = () => {
  const steps = [
    {
      label: "Development",
      description: "Develop features, write tests, and submit for review",
      details: [
        "Write code and tests",
        "Run npm test locally",
        "Create changeset file",
        "Submit pull request",
        "Code review and merge",
      ],
    },
    {
      label: "Version Planning",
      description: "Changesets creates version PR with calculated changes",
      details: [
        "Changesets bot analyzes changes",
        "Version numbers calculated",
        "Changelog generated",
        "Team reviews version PR",
      ],
    },
    {
      label: "Publishing",
      description: "Automated build and publish to registry",
      details: [
        "Merge version PR",
        "GitHub Actions builds packages",
        "Publish to npm registry",
        "Create Git tags",
      ],
    },
    {
      label: "Integration",
      description: "Test integration and update documentation",
      details: [
        "Test with Verdaccio locally",
        "Integration tests in host apps",
        "Verify compatibility",
        "Update documentation",
      ],
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
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
                <Paper sx={{ p: 2, height: "100%" }}>
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

      {/* Changeset Commands */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Changeset Commands
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Use these commands to manage versioning and releases with changesets.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Create Changeset
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Create a changeset file describing your changes:
                </Typography>
                <CodeHighlight code={`# Interactive changeset creation
npm run changeset

# Follow prompts to:
# 1. Select packages that changed
# 2. Choose version bump type (major/minor/patch)
# 3. Write summary of changes`} language="bash" />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Version & Publish
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Apply changesets and publish:
                </Typography>
                <CodeHighlight code={`# Apply changesets (create version PR)
npm run changeset:version

# Publish to npm (merge version PR triggers this)
npm run changeset:publish`} language="bash" />
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Example Changeset File
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Changeset files are created in <code>.changeset/</code> directory:
            </Typography>
            <CodeHighlight code={`---
"@smbc/employee-directory-mui": minor
"@smbc/mui-applet-core": patch
---

Add bulk actions to employee directory

- Implement bulk activate/deactivate actions
- Add transaction mode support for bulk operations
- Fix TypeScript issues in bulk action helpers

This change adds bulk action capabilities to the employee directory,
allowing users to activate or deactivate multiple employees at once.`} language="markdown" />
          </Box>
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
              <CodeHighlight code={`# Start local registry
npm run registry:start

# Switch to local registry
npm run registry:use-local

# Build and publish test version
npm run build
npm run registry:publish

# Test in host app
cd /tmp/test-project
npm install @smbc/my-applet@latest

# Switch back to npm registry when done
npm run registry:use-npm`} language="bash" />
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
              <Paper sx={{ p: 2, mb: 2 }}>
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
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
