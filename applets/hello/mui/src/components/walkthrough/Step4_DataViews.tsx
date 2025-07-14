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
      id={`step4-tabpanel-${index}`}
      aria-labelledby={`step4-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface CodeBlockProps {
  filename: string;
  children: string;
  language?: string;
}

function CodeBlock({ filename, children, language = "typescript" }: CodeBlockProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="body2"
        sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
      >
        {filename}
      </Typography>
      <CodeHighlight code={children} language={language} />
    </Box>
  );
}

export const Step4_DataViews: React.FC = () => {
  const [appletTabValue, setAppletTabValue] = useState(0);
  const [configTabValue, setConfigTabValue] = useState(0);

  const handleAppletTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setAppletTabValue(newValue);
  };

  const handleConfigTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setConfigTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        DataView Configuration
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        The DataView implementation uses a{" "}
        <strong>Configuration-Based Architecture</strong> with modular config
        files for maintainability and reusability.
      </Typography>

      {/* Main Applet Implementation */}
      <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
        🎯 Core Implementation Files
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Main applet files in <code>applets/employee-directory/mui/src/</code>
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={appletTabValue} onChange={handleAppletTabChange}>
          <Tab label="Applet.tsx" />
          <Tab label="index.ts" />
          <Tab label="permissions.ts" />
        </Tabs>
        
        <TabPanel value={appletTabValue} index={0}>
          <CodeBlock filename="applets/employee-directory/mui/src/Applet.tsx">
{`import React from "react";
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions } from "@smbc/applet-core";
import { createAppletConfig } from "./config";
import permissions from "./permissions";

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  const { hasPermission } = usePermissions();

  const config = createAppletConfig({
    permissions: {
      canCreate: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
      canEdit: hasPermission("employee-directory", permissions.EDIT_EMPLOYEES),
      canDelete: hasPermission("employee-directory", permissions.MANAGE_EMPLOYEES),
    },
  });

  const handleSuccess = (_action: "create" | "edit" | "delete", _item?: any) => {
    // Success notifications
  };

  const handleError = (action: "create" | "edit" | "delete", error: any, item?: any) => {
    console.error(\`Error: \${action}\`, error, item);
  };

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="employee-directory"
      onSuccess={handleSuccess}
      onError={handleError}
      options={{
        transaction: {
          enabled: true,
          requireConfirmation: true,
          allowPartialSuccess: true,
          emitActivities: true,
        },
      }}
    />
  );
};`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={appletTabValue} index={1}>
          <CodeBlock filename="applets/employee-directory/mui/src/index.ts">
{`import { Applet } from "./Applet";
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
  version: packageJson.version,
  // NOTE: NO getHostNavigation - config-based applets don't expose internal routes
};`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={appletTabValue} index={2}>
          <CodeBlock filename="applets/employee-directory/mui/src/permissions.ts">
{`export default {
  VIEW_EMPLOYEES: "VIEW_EMPLOYEES",
  EDIT_EMPLOYEES: "EDIT_EMPLOYEES", 
  MANAGE_EMPLOYEES: "MANAGE_EMPLOYEES",
} as const;

// These permissions control:
// - Visibility of create/edit/delete actions
// - Form access restrictions
// - API endpoint access
// - UI component rendering`}
          </CodeBlock>
        </TabPanel>
      </Box>

      {/* Configuration Files */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        ⚙️ Configuration Files
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Modular configuration in <code>applets/employee-directory/mui/src/config/</code>
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={configTabValue} onChange={handleConfigTabChange}>
          <Tab label="index.ts" />
          <Tab label="filters.ts" />
          <Tab label="api.ts" />
          <Tab label="columns.tsx" />
          <Tab label="forms.ts" />
        </Tabs>
        
        <TabPanel value={configTabValue} index={0}>
          <CodeBlock filename="applets/employee-directory/mui/src/config/index.ts">
{`import { type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import type { components } from "@smbc/employee-directory-api/generated/types";
import { createApiConfig } from "./api";
import { createSchemaConfig } from "./schema";
import { createColumnsConfig } from "./columns";
import { createFiltersConfig } from "./filters";
import { createActionsConfig } from "./actions";
import { createBulkActionsConfig } from "./bulkActions";
import { createGlobalActionsConfig } from "./globalActions";
import { createFormsConfig } from "./forms";

type Employee = components["schemas"]["Employee"];

export function createAppletConfig({
  permissions,
}: { permissions: { canCreate: boolean; canEdit: boolean; canDelete: boolean; } }): MuiDataViewAppletConfig<Employee> {
  return {
    api: createApiConfig(),
    schema: createSchemaConfig(),
    columns: createColumnsConfig(),
    filters: createFiltersConfig(),
    actions: {
      row: createActionsConfig({ canEdit: permissions.canEdit, canDelete: permissions.canDelete }),
      bulk: createBulkActionsConfig({ canEdit: permissions.canEdit, canDelete: permissions.canDelete }),
      global: createGlobalActionsConfig({ canCreate: permissions.canCreate }),
    },
    forms: createFormsConfig({ canCreate: permissions.canCreate, canEdit: permissions.canEdit }),
    pagination: { enabled: true, defaultPageSize: 25, pageSizeOptions: [10, 25, 50, 100] },
    activity: {
      enabled: true,
      entityType: "employee",
      labelGenerator: (employee: Employee) => employee.name,
      urlGenerator: (employee: Employee) => \`#/employees/\${employee.id}\`,
    },
  };
}`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={configTabValue} index={1}>
          <CodeBlock filename="applets/employee-directory/mui/src/config/filters.ts">
{`export const createFiltersConfig = () => ({
  fields: [
    {
      name: "search",
      type: "search" as const,
      label: "Search employees",
      placeholder: "Search by name or email...",
      fullWidth: true, // Takes remaining space
    },
    {
      name: "department",
      type: "select" as const,
      label: "Department",
      options: [
        { label: "All Departments", value: "" },
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" },
        { label: "Marketing", value: "marketing" },
        { label: "HR", value: "hr" },
        { label: "Finance", value: "finance" },
      ],
    },
    {
      name: "active",
      type: "boolean" as const,
      label: "Active only",
    },
  ],
});`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={configTabValue} index={2}>
          <CodeBlock filename="applets/employee-directory/mui/src/config/api.ts">
{`export const createApiConfig = () => ({
  baseUrl: "/api/v1/employee-directory",
  endpoints: {
    list: { path: "/employees", method: "GET" as const },
    read: { path: "/employees/:id", method: "GET" as const },
    create: { path: "/employees", method: "POST" as const },
    update: { path: "/employees/:id", method: "PATCH" as const },
    delete: { path: "/employees/:id", method: "DELETE" as const },
  },
  resourceName: "employee",
  defaultSort: { field: "name", direction: "asc" as const },
});`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={configTabValue} index={3}>
          <CodeBlock filename="applets/employee-directory/mui/src/config/columns.tsx">
{`import React from "react";
import { Avatar, Chip, Box } from "@mui/material";
import type { components } from "@smbc/employee-directory-api/generated/types";

type Employee = components["schemas"]["Employee"];

export const createColumnsConfig = () => [
  {
    name: "name",
    label: "Name",
    sortable: true,
    render: (employee: Employee) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          {employee.name.charAt(0).toUpperCase()}
        </Avatar>
        {employee.name}
      </Box>
    ),
  },
  {
    name: "email",
    label: "Email",
    sortable: true,
  },
  {
    name: "department",
    label: "Department",
    sortable: true,
    render: (employee: Employee) => (
      <Chip
        label={employee.department}
        variant="outlined"
        size="small"
      />
    ),
  },
  {
    name: "role",
    label: "Role",
    sortable: true,
  },
  {
    name: "active",
    label: "Status",
    sortable: true,
    render: (employee: Employee) => (
      <Chip
        label={employee.active ? "Active" : "Inactive"}
        color={employee.active ? "success" : "default"}
        size="small"
      />
    ),
  },
];`}
          </CodeBlock>
        </TabPanel>
        
        <TabPanel value={configTabValue} index={4}>
          <CodeBlock filename="applets/employee-directory/mui/src/config/forms.ts">
{`export const createFormsConfig = ({ canCreate, canEdit }: { canCreate: boolean; canEdit: boolean }) => ({
  create: canCreate ? {
    title: "Add New Employee",
    fields: [
      { name: "name", type: "text" as const, label: "Full Name", required: true },
      { name: "email", type: "email" as const, label: "Email Address", required: true },
      { name: "department", type: "select" as const, label: "Department", required: true, 
        options: [
          { label: "Engineering", value: "engineering" },
          { label: "Sales", value: "sales" },
          { label: "Marketing", value: "marketing" },
          { label: "HR", value: "hr" },
          { label: "Finance", value: "finance" },
        ]
      },
      { name: "role", type: "text" as const, label: "Job Title", required: true },
      { name: "active", type: "boolean" as const, label: "Active Employee", defaultValue: true },
    ],
  } : undefined,
  
  edit: canEdit ? {
    title: "Edit Employee",
    fields: [
      { name: "name", type: "text" as const, label: "Full Name", required: true },
      { name: "email", type: "email" as const, label: "Email Address", required: true },
      { name: "department", type: "select" as const, label: "Department", required: true,
        options: [
          { label: "Engineering", value: "engineering" },
          { label: "Sales", value: "sales" },
          { label: "Marketing", value: "marketing" },
          { label: "HR", value: "hr" },
          { label: "Finance", value: "finance" },
        ]
      },
      { name: "role", type: "text" as const, label: "Job Title", required: true },
      { name: "active", type: "boolean" as const, label: "Active Employee" },
    ],
  } : undefined,
});`}
          </CodeBlock>
        </TabPanel>
      </Box>
      
      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary" }}
      >
        ✅ <strong>Principles Applied:</strong> Configuration-driven
        architecture, automatic hash navigation, permission-based features, and
        type-safe API integration.
      </Typography>
    </Box>
  );
};
