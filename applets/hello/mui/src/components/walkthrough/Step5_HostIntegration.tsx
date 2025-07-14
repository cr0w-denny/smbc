import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { CodeHighlight } from "../CodeHighlight";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`step5-tabpanel-${index}`}
      aria-labelledby={`step5-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Step5_HostIntegration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Self-Contained Deployment
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        The final step shows how the applet is <strong>Self-Contained</strong>{" "}
        and <strong>Plugs In Anywhere</strong>.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Mock Data Setup" />
          <Tab label="Host Registration" />
          <Tab label="Applet Export" />
          <Tab label="Final Integration" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Step 1: Export Mock Handlers</strong> - Add to devtools
              packages
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              packages/applet-devtools/src/index.ts
            </Typography>
            <CodeHighlight
              code={`
export { handlers as employeeDirectoryHandlers } from "./mocks/employee-directory";

export {
  // ... other exports
  employeeDirectoryHandlers,
} from '@smbc/applet-devtools';`}
              language="typescript"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Step 2: Configure Host App</strong> - Add to app.config.ts for mock handlers and applet mounting
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              apps/mui-host-dev/src/app.config.ts
            </Typography>
            <CodeHighlight
              code={`// apps/mui-host-dev/src/app.config.ts
import {
  userManagementHandlers,
  productCatalogHandlers,
  employeeDirectoryHandlers, // Add this
} from '@smbc/mui-applet-devtools';

// Import applets
import employeeDirectoryApplet from '../../../applets/employee-directory/mui/src';

// Mock handlers mapping for development
export const MOCK_HANDLERS = {
  "user-management": userManagementHandlers,
  "product-catalog": productCatalogHandlers,
  "employee-directory": employeeDirectoryHandlers, // Add this mapping
} as const;

// Add to applet mounting configuration
export function createApplets(environment = 'development') {
  return [
    // ... other applets
    mountApplet(employeeDirectoryApplet, {
      id: "employee-directory",
      label: "Employee Directory", 
      path: "/employees",
      icon: BadgeIcon,
      permissions: [employeeDirectoryApplet.permissions.VIEW_EMPLOYEES],
      apiBaseUrl: getApiUrl("employee-directory", environment),
      version: employeeDirectoryApplet.version,
    }),
  ];
}`}
              language="typescript"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Step 3: Applet Configuration</strong> - Export for applet
              store discovery
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              employee-directory/mui/src/index.ts
            </Typography>
            <CodeHighlight
              code={`
import { Applet } from "./Applet";
import permissions from "./permissions";
import { spec } from "@smbc/employee-directory-api";
import packageJson from "../package.json";

// Export for applet store - NO getHostNavigation needed!
export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Employee Directory API", 
    spec,
  },
  version: packageJson.version,
};

// CRITICAL: Remove any getHostNavigation export - this prevents
// internal routes from showing in the navigation drawer`}
              language="typescript"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Step 4: Build & Integration</strong> - Generate types and
              test
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              Build & Integration Commands
            </Typography>
            <CodeHighlight
              code={`# Build API and generate all artifacts
cd applets/employee-directory/api
npm run build
npm run generate:all

# Build applet
cd ../mui  
npm run build

# Test in host (dev environment)
cd ../../../apps/mui-host-dev
npm run dev

# Result: Employee Directory appears in applet store with:
# ✅ Working CRUD operations  
# ✅ Search filtering with fullWidth search taking remaining space
# ✅ Mock data loading correctly
# ✅ Permission-based feature visibility
# ✅ Hash-based URL state persistence
# ✅ No internal navigation exposure - just single applet entry`}
              language="bash"
            />
          </Box>
        </TabPanel>
      </Box>

      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary" }}
      >
        ✅ <strong>All Principles Applied:</strong> The applet is fully
        self-contained, secure, navigable, and integrates seamlessly.
      </Typography>
    </Box>
  );
};
