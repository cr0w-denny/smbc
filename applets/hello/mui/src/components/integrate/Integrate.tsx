import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  GridLegacy as Grid,
} from "@mui/material";
import { CodeHighlight } from "../CodeHighlight";

export const Integrate: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const AppConfigTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Create <code>app.config.ts</code> to define applets, permissions, and mock handlers.
      </Alert>
      
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        App Configuration
      </Typography>
      <CodeHighlight
        language="typescript"
        code={`// apps/mui-host-dev/src/app.config.ts
import {
  createPermissionRequirements,
  generatePermissionMappings,
  mountApplet,
} from "@smbc/applet-core";
import {
  userManagementHandlers,
  productCatalogHandlers,
  employeeDirectoryHandlers,
} from "@smbc/mui-applet-devtools";

import userManagementApplet from '../../../applets/user-management/mui/src';
import employeeDirectoryApplet from '../../../applets/employee-directory/mui/src';

// Mock handlers for development
export const MOCK_HANDLERS = {
  "user-management": userManagementHandlers,
  "product-catalog": productCatalogHandlers, 
  "employee-directory": employeeDirectoryHandlers,
} as const;

// Permission requirements for each applet
const permissionRequirements = createPermissionRequirements({
  "user-management": {
    applet: userManagementApplet,
    permissions: {
      VIEW_USERS: "Staff",
      CREATE_USERS: "Manager",
      EDIT_USERS: "Manager",
      DELETE_USERS: "Admin",
    }
  },
  "employee-directory": {
    applet: employeeDirectoryApplet,
    permissions: {
      VIEW_EMPLOYEES: "Staff",
      EDIT_EMPLOYEES: "Manager",
      MANAGE_EMPLOYEES: "Admin",
    }
  }
});

export const ROLE_CONFIG: RoleConfig = {
  roles: ["Guest", "Staff", "Manager", "Admin"],
  permissionMappings: generatePermissionMappings(
    ["Guest", "Staff", "Manager", "Admin"],
    permissionRequirements,
  ),
};

export function createApplets(environment = 'development') {
  return [
    mountApplet(userManagementApplet, {
      id: "user-management",
      label: "User Management",
      path: "/user-management",
      icon: PeopleIcon,
      permissions: [userManagementApplet.permissions.VIEW_USERS],
    }),
    mountApplet(employeeDirectoryApplet, {
      id: "employee-directory",
      label: "Employee Directory",
      path: "/employees",
      icon: BadgeIcon,
      permissions: [employeeDirectoryApplet.permissions.VIEW_EMPLOYEES],
    }),
  ];
}`}
      />
    </Box>
  );

  const MainAppTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Set up providers and routing in your main App component.
      </Alert>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Main App Component
      </Typography>
      <CodeHighlight
        language="typescript"
        code={`// apps/mui-host-dev/src/App.tsx
import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  AppletProvider, 
  FeatureFlagProvider,
  calculatePermissionsFromRoles 
} from '@smbc/applet-core';
import { ActivityProvider, TransactionProvider } from '@smbc/react-query-dataview';

import { lightTheme } from '@smbc/mui-components';
import { AppletRouter } from './components/AppletRouter';
import { AppletDrawer } from './components/AppletDrawer';
import { createApplets, ROLE_CONFIG, DEMO_USER, HOST } from './app.config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
    },
  },
});

export function App() {
  const applets = createApplets('development');
  const userWithPermissions = {
    ...DEMO_USER,
    permissions: calculatePermissionsFromRoles(DEMO_USER.roles, ROLE_CONFIG),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <FeatureFlagProvider configs={featureFlags}>
          <ActivityProvider>
            <TransactionProvider>
              <AppletProvider
                initialRoleConfig={ROLE_CONFIG}
                initialUser={userWithPermissions}
              >
                <Box sx={{ display: 'flex' }}>
                  <AppletDrawer 
                    applets={applets} 
                    constants={HOST}
                    title={HOST.appName}
                  />
                  <AppletRouter 
                    applets={applets} 
                    roleConfig={ROLE_CONFIG}
                    constants={HOST}
                  />
                </Box>
              </AppletProvider>
            </TransactionProvider>
          </ActivityProvider>
        </FeatureFlagProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}`}
      />
    </Box>
  );

  const MSWTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Set up Mock Service Worker for development API mocking.
      </Alert>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        MSW Integration
      </Typography>
      <CodeHighlight
        language="typescript"
        code={`// apps/mui-host-dev/src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { MOCK_HANDLERS } from '../app.config';

// Flatten the handlers object into an array
const allHandlers = Object.values(MOCK_HANDLERS).flat();
export const worker = setupWorker(...allHandlers);

// apps/mui-host-dev/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'warn',
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});`}
      />
    </Box>
  );

  const AppletStructureTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Each applet exports a standard interface with component, permissions,
        and API spec.
      </Alert>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Individual Applet Structure
      </Typography>
      <CodeHighlight
        language="typescript"
        code={`// applets/employee-directory/mui/src/index.ts
import { Applet } from './Applet';
import permissions from './permissions';
import spec from '@smbc/employee-directory-api';
import packageJson from '../package.json';

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Employee Directory API",
    spec,
  },
  version: packageJson.version,
};

// applets/employee-directory/mui/src/Applet.tsx
import { MuiDataViewApplet } from '@smbc/mui-applet-core';
import { usePermissions } from '@smbc/applet-core';
import { createAppletConfig } from './config';

export const Applet: React.FC<{ mountPath: string }> = ({ mountPath }) => {
  const { hasPermission } = usePermissions();
  
  const config = createAppletConfig({
    permissions: {
      canCreate: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
      canEdit: hasPermission("employee-directory", permissions.EDIT_EMPLOYEES),
      canDelete: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
    },
  });

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="employee-directory"
      options={{ transaction: { enabled: true } }}
    />
  );
};`}
      />
    </Box>
  );

  const tabs = [
    {
      label: "App Config",
      component: <AppConfigTab />,
    },
    {
      label: "Main App",
      component: <MainAppTab />,
    },
    {
      label: "MSW Integration",
      component: <MSWTab />,
    },
    {
      label: "Applet Structure",
      component: <AppletStructureTab />,
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                📦
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Install Package
              </Typography>
              <Typography variant="body2">
                Add the applet packages to your project dependencies.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                ⚙️
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Configure App
              </Typography>
              <Typography variant="body2">
                Set up applets, permissions, and mock handlers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: "3rem", mb: 2 }}>
                🚀
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Setup Providers
              </Typography>
              <Typography variant="body2">
                Add providers and routing to your main App component.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              sx={{ fontWeight: activeTab === index ? "bold" : "normal" }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>{tabs[activeTab]?.component}</Box>
      </Card>
    </Box>
  );
};
