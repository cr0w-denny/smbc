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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export const ConfigurationGuide: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const configExamples = [
    {
      label: "Basic Setup",
      code: `import userApplet from "@smbc/user-management-mui";
import { AppletProvider, AppletRenderer } from "@smbc/applet-core";

function App() {
  return (
    <AppletProvider
      config={{
        apiBaseUrl: "https://api.example.com",
        permissions: userService.getPermissions(),
        theme: customTheme,
      }}
    >
      <AppletRenderer 
        applet={userApplet}
        mountPath="/users"
      />
    </AppletProvider>
  );
}`
    },
    {
      label: "Advanced Configuration",
      code: `const appletConfig = {
  id: "user-management",
  label: "Users",
  path: "/users",
  apiBaseUrl: process.env.REACT_APP_API_URL,
  
  // Permission mapping
  permissions: {
    view: "USER_READ",
    create: "USER_CREATE", 
    edit: "USER_UPDATE",
    delete: "USER_DELETE"
  },
  
  // Custom theme overrides
  theme: {
    primary: { main: "#1976d2" },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none" }
        }
      }
    }
  },
  
  // Feature flags
  features: {
    enableBulkActions: true,
    enableAdvancedSearch: false,
    maxPageSize: 100
  }
};`
    },
    {
      label: "Environment Setup",
      code: `# Production
REACT_APP_API_URL=https://api.production.com
REACT_APP_MSW_ENABLED=false

# Development  
REACT_APP_API_URL=https://api.staging.com
REACT_APP_MSW_ENABLED=true

# Local Development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_MSW_ENABLED=true`
    }
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          Detailed configuration options and examples for integrating applets.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {configExamples.map((example, index) => (
            <Tab 
              key={index}
              label={example.label}
              sx={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
            />
          ))}
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: (theme) => theme.palette.mode === "dark" 
              ? theme.palette.background.paper 
              : "grey.50",
            border: (theme) => theme.palette.mode === "dark" 
              ? "1px solid rgba(255, 255, 255, 0.08)" 
              : "none"
          }}>
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
                whiteSpace: "pre-wrap",
              }}
            >
              {configExamples[activeTab]?.code}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Router Integration
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Seamlessly integrate with popular React routing libraries.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <Chip label="React Router" size="small" sx={{ mr: 1 }} />
                  Native support with route nesting
                </Typography>
                <Typography variant="body2">
                  <Chip label="Next.js" size="small" sx={{ mr: 1 }} />
                  File-based routing integration
                </Typography>
                <Typography variant="body2">
                  <Chip label="Reach Router" size="small" sx={{ mr: 1 }} />
                  Legacy support available
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                State Management
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Flexible integration with your existing state management.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <Chip label="Redux" size="small" sx={{ mr: 1 }} />
                  Connect to existing Redux store
                </Typography>
                <Typography variant="body2">
                  <Chip label="Zustand" size="small" sx={{ mr: 1 }} />
                  Lightweight state sharing
                </Typography>
                <Typography variant="body2">
                  <Chip label="Context" size="small" sx={{ mr: 1 }} />
                  React Context integration
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Common Configuration Patterns
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Permission Mapping</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? theme.palette.background.paper 
                : "grey.50",
              border: (theme) => theme.palette.mode === "dark" 
                ? `1px solid ${theme.palette.divider}` 
                : "none"
            }}>
              <Typography
                component="pre"
                variant="body2"
                sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
              >
                {`// Map your permission system to applet permissions
const permissionMapper = {
  [userApplet.permissions.VIEW_USERS]: hasRole("user_viewer"),
  [userApplet.permissions.CREATE_USERS]: hasRole("user_admin"),
  [userApplet.permissions.EDIT_USERS]: hasRole("user_admin"),
  [userApplet.permissions.DELETE_USERS]: hasRole("super_admin"),
};

// Use in AppletProvider
<AppletProvider permissions={permissionMapper}>
  {/* applets */}
</AppletProvider>`}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Theme Customization</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? theme.palette.background.paper 
                : "grey.50",
              border: (theme) => theme.palette.mode === "dark" 
                ? `1px solid ${theme.palette.divider}` 
                : "none"
            }}>
              <Typography
                component="pre"
                variant="body2"
                sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
              >
                {`// Extend your existing theme for applets
const appletTheme = createTheme({
  ...yourExistingTheme,
  components: {
    ...yourExistingTheme.components,
    // Applet-specific overrides
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
          },
        },
      },
    },
  },
});`}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">API Client Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? theme.palette.background.paper 
                : "grey.50",
              border: (theme) => theme.palette.mode === "dark" 
                ? `1px solid ${theme.palette.divider}` 
                : "none"
            }}>
              <Typography
                component="pre"
                variant="body2"
                sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
              >
                {`// Custom API client with authentication
const apiClient = createApiClient({
  baseURL: process.env.REACT_APP_API_URL,
  
  // Add authentication headers
  interceptors: {
    request: (config) => ({
      ...config,
      headers: {
        ...config.headers,
        Authorization: \`Bearer \${getAuthToken()}\`,
        'X-Client-Version': process.env.REACT_APP_VERSION,
      },
    }),
    
    // Handle errors globally
    response: {
      onError: (error) => {
        if (error.status === 401) {
          redirectToLogin();
        }
        return Promise.reject(error);
      },
    },
  },
});`}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Paper sx={{ 
        p: 3, 
        backgroundColor: (theme) => theme.palette.mode === "dark" 
          ? theme.palette.background.paper 
          : "grey.50",
        border: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "none"
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🔧 Troubleshooting
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Common Issues:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                • Bundle size too large → Enable tree shaking
              </Typography>
              <Typography variant="body2">
                • Styling conflicts → Use CSS-in-JS isolation
              </Typography>
              <Typography variant="body2">
                • Permission errors → Check mapping configuration
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Performance Tips:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                • Lazy load applets with React.lazy()
              </Typography>
              <Typography variant="body2">
                • Enable React Query devtools in development
              </Typography>
              <Typography variant="body2">
                • Monitor network requests in browser tools
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};