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
      id={`step3-tabpanel-${index}`}
      aria-labelledby={`step3-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Step3_ComponentStructure: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Standard Interface Implementation
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Now we create the React component following the{" "}
        <strong>Standard Interface</strong> pattern.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="index.ts" />
          <Tab label="Applet.tsx" />
          <Tab label="Config Structure" />
          <Tab label="Permissions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              employee-directory/mui/src/index.ts - Standard Interface Export
            </Typography>
            <CodeHighlight
              code={`
import { Applet } from "./Applet";
import permissions from "./permissions";
import { spec } from "@smbc/employee-directory-api";
import packageJson from "../package.json";

// Modern applet export - no navigation needed!
export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Employee Directory API",
    spec,
  },
  version: packageJson.version
};`}
              language="typescript"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              employee-directory/mui/src/Applet.tsx - DataView Implementation
            </Typography>
            <CodeHighlight
              code={`
import React from "react";
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions } from "@smbc/applet-core";
import { createEmployeeDirectoryConfig } from "./config";
import permissions from "./permissions";

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  const { hasPermission } = usePermissions();

  const config = createEmployeeDirectoryConfig({
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
    />
  );
};`}
              language="typescript"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              Directory structure:
            </Typography>
            <CodeHighlight
              code={`
employee-directory/mui/src/
├── Applet.tsx              # Main component using MuiDataViewApplet
├── index.ts                # Standard applet export
├── permissions.ts          # Permission definitions
└── config/                 # Modular configuration
    ├── index.ts            # Main config factory
    ├── api.ts              # API endpoint configurations
    ├── schema.ts           # Data validation schemas  
    ├── columns.tsx         # Table column definitions
    ├── filters.ts          # Search and filter configurations
    ├── actions.ts          # Row action configurations
    ├── bulkActions.ts      # Bulk operation configurations
    ├── globalActions.ts    # Global action configurations (create)
    └── forms.ts            # Form field configurations

# This structure provides:
# ✅ Clear separation of concerns
# ✅ Easy testing of individual configurations
# ✅ Reusable configuration patterns
# ✅ Type-safe configuration objects`}
              language="bash"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
            >
              employee-directory/mui/src/permissions.ts
            </Typography>
            <CodeHighlight
              code={`// employee-directory/mui/src/permissions.ts
import { definePermissions } from "@smbc/applet-core";

/**
 * Employee Directory Applet Permissions
 * 
 * Defines permissions that the host application will map to roles.
 * The applet only declares what permissions exist - the host decides
 * which roles get which permissions.
 */
export default definePermissions('employee-directory', {
  /** Permission to view employee list and details */
  VIEW_EMPLOYEES: "Can view employee directory",
  
  /** Permission to modify existing employee information */
  EDIT_EMPLOYEES: "Can edit employee information", 
  
  /** Permission to add or remove employees from the directory */
  MANAGE_EMPLOYEES: "Can add/remove employees",
});

// These permissions control:
// - Visibility of create/edit/delete actions
// - Form access restrictions
// - API endpoint access
// - UI component rendering`}
              language="typescript"
            />
          </Box>
        </TabPanel>
      </Box>

      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary" }}
      >
        ✅ <strong>Principle Applied:</strong> Standard interface means any host
        can integrate this applet without custom code.
      </Typography>

      <Box
        sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          Test the structure:
        </Typography>
        <CodeHighlight
          code={`# First build and generate the API
cd applets/employee-directory/api
npm run build
npm run generate:all

# Then test the MUI applet structure
cd ../mui
npm install
npm run typecheck  # Should pass
npm run build      # Should build successfully`}
          language="bash"
        />
      </Box>
    </Box>
  );
};
