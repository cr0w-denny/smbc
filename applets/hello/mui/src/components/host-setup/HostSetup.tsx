import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  Rocket as RocketIcon,
} from "@mui/icons-material";
import { CodeHighlight } from "../CodeHighlight";

export const HostSetup: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const steps = [
    {
      label: "Create Host App",
      icon: <CodeIcon />,
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Use the <code>create-host-app</code> script to scaffold a new host application with all necessary dependencies and configuration.
          </Alert>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            🚀 Quick Start
          </Typography>
          
          <CodeHighlight
            language="bash"
            code={`# Create a new host app with MUI dev tools (recommended)
npx @smbc/applet-cli create-host-app my-host-app

# Or create a basic host app
npx @smbc/applet-cli create-host-app my-host-app --template basic

# Navigate to your new app
cd my-host-app
npm install`}
          />

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              Template Options:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Chip label="Recommended" color="primary" size="small" />
                </ListItemIcon>
                <ListItemText
                  primary="mui-devtools (default)"
                  secondary="Full-featured setup with MuiHostApp, mock generation, dev tools, and comprehensive configuration"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Chip label="Minimal" color="default" size="small" />
                </ListItemIcon>
                <ListItemText
                  primary="basic"
                  secondary="Minimal setup with just React Query, MUI theming, and basic AppletHost"
                />
              </ListItem>
            </List>
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            What gets created:
          </Typography>
          
          <CodeHighlight
            language="text"
            code={`my-host-app/
├── public/
├── src/
│   ├── generated/          # Auto-generated mocks (mui-devtools only)
│   ├── App.tsx            # Main app component
│   ├── applet.config.ts   # Applet configuration
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts     # Type definitions
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts`}
          />
        </Box>
      ),
    },
    {
      label: "Install Applets",
      icon: <BuildIcon />,
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Install applet packages and configure them in your host application.
          </Alert>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            📦 Install Applet Packages
          </Typography>
          
          <CodeHighlight
            language="bash"
            code={`# Install applets you want to use
npm install @smbc/usage-stats-mui
npm install @smbc/user-management-mui
npm install @smbc/employee-directory-mui

# Install applet APIs for TypeScript types and mock generation
npm install @smbc/usage-stats-api
npm install @smbc/user-management-api
npm install @smbc/employee-directory-api`}
          />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", mt: 3 }}>
            ⚙️ Configure Applets
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update <code>src/applet.config.ts</code> to mount your applets:
          </Typography>

          <CodeHighlight
            language="typescript"
            code={`import {
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
  mountApplet,
} from "@smbc/applet-core";

// Import your applets
import usageStatsApplet from "@smbc/usage-stats-mui";
import userManagementApplet from "@smbc/user-management-mui";
import { Analytics, People } from "@mui/icons-material";

// Update permission requirements
const permissionRequirements = createPermissionRequirements({
  "usage-stats": minRole(usageStatsApplet, {
    VIEW_USAGE_STATS: "Manager",
    EXPORT_USAGE_DATA: "Admin",
  }),
  "user-management": minRole(userManagementApplet, {
    VIEW_USERS: "Staff",
    CREATE_USERS: "Manager",
    EDIT_USERS: "Manager", 
    DELETE_USERS: "Admin",
  }),
});

// Mount your applets
export const APPLETS: AppletMount[] = [
  mountApplet(usageStatsApplet, {
    id: "usage-stats",
    label: "Usage Analytics",
    path: "/usage-stats", 
    icon: Analytics,
    permissions: [usageStatsApplet.permissions.VIEW_USAGE_STATS],
    version: "1.0.0",
  }),
  mountApplet(userManagementApplet, {
    id: "user-management",
    label: "User Management",
    path: "/user-management",
    icon: People,
    permissions: [userManagementApplet.permissions.VIEW_USERS],
    version: "1.0.0",
  }),
];`}
          />
        </Box>
      ),
    },
    {
      label: "Generate Mocks",
      icon: <PlayIcon />,
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Generate mock handlers for development using the applet-cli wizard.
          </Alert>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            🎭 Generate Mock Data
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            For mui-devtools template, run the setup script to automatically generate mocks:
          </Typography>

          <CodeHighlight
            language="bash"
            code={`# Generate mocks for all configured applets
npm run generate-mocks

# Or run the full setup (install + generate mocks)
npm run setup`}
          />

          <Typography variant="body2" sx={{ mb: 2, mt: 3 }}>
            This will analyze your applet configuration and create mock handlers in <code>src/generated/mocks.ts</code>:
          </Typography>

          <CodeHighlight
            language="typescript"
            code={`// src/generated/mocks.ts (auto-generated)
import { http, HttpResponse } from 'msw';

export const usageStatsHandlers = [
  http.get('/api/v1/usage-stats', () => {
    return HttpResponse.json({
      totalUsers: 1250,
      activeUsers: 890,
      // ... generated mock data
    });
  }),
  // ... more handlers
];

export const userManagementHandlers = [
  http.get('/api/v1/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      // ... generated mock data
    ]);
  }),
  // ... more handlers
];

export const allHandlers = [
  ...usageStatsHandlers,
  ...userManagementHandlers,
];`}
          />

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Pro tip:</strong> The mock generation is intelligent and creates realistic data based on your API specifications. You can customize the generated mocks by editing the generated files.
            </Typography>
          </Alert>
        </Box>
      ),
    },
    {
      label: "Run Development Server",
      icon: <RocketIcon />,
      content: (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your host application is ready! Start the development server and begin using your applets.
          </Alert>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            🎉 Start Development
          </Typography>
          
          <CodeHighlight
            language="bash"
            code={`# Start the development server
npm run dev

# Your app will be available at:
# http://localhost:3000`}
          />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", mt: 3 }}>
            🎛️ Features Available (mui-devtools template)
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Complete MUI-themed host app with navigation drawer" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Mock Service Worker for API simulation" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Environment switching (mock/dev/staging/prod)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Role-based permissions with live preview" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="React Query dev tools for debugging" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Hot module reloading for fast development" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="API documentation modal for each applet" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            🔧 Environment Variables
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Create a <code>.env</code> file to customize your development environment:
          </Typography>

          <CodeHighlight
            language="bash"
            code={`# .env
# Disable mock service worker to use real APIs
VITE_DISABLE_MSW=false

# Customize development port
VITE_PORT=3000`}
          />

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Next steps:</strong> Try switching between different user roles in the dashboard, explore the API documentation, and test your applets in the mock environment before connecting to real APIs.
            </Typography>
          </Alert>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          🏗️ Host App Setup Walkthrough
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how to create a complete host application using the SMBC applet ecosystem. 
          This walkthrough will guide you through creating a new host app, installing applets, 
          generating mocks, and running your development environment.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: 'pointer' }}
                  icon={step.icon}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {step.content}
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mr: 1 }}
                      disabled={activeStep === steps.length - 1}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                🎉 Congratulations!
              </Typography>
              <Typography variant="body2">
                You've successfully set up a complete host application with the SMBC applet ecosystem. 
                Your app now has professional-grade infrastructure including routing, permissions, 
                mock APIs, and development tools.
              </Typography>
              <Button
                onClick={() => setActiveStep(0)}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                Start Over
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};