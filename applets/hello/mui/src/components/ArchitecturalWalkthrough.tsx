import React, { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ArchitecturalWalkthrough: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const steps = [
    {
      label: "1. Define the API Contract",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Start with TypeSpec Definition
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Before writing any code, we define our data contract. This demonstrates the <strong>API-First Design</strong> principle in action.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="main.tsp" />
              <Tab label="Generated Types" />
              <Tab label="Mock Data" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/api/main.tsp
import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "Employee Directory API",
  version: "1.0.0",
})
namespace EmployeeDirectory;

model Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
}

model EmployeeFilters {
  search?: string;
  department?: string;
  active?: boolean;
}

@route("/employees")
interface Employees {
  @get list(@query filters: EmployeeFilters): Employee[];
  @get read(@path id: string): Employee;
  @post create(@body employee: Employee): Employee;
  @patch update(@path id: string, @body updates: Partial<Employee>): Employee;
  @delete remove(@path id: string): void;
}`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// Generated automatically from TypeSpec
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  active?: boolean;
}

export const EmployeeAPI = {
  list: (filters: EmployeeFilters): Promise<Employee[]> => { /* generated */ },
  read: (id: string): Promise<Employee> => { /* generated */ },
  create: (employee: Employee): Promise<Employee> => { /* generated */ },
  update: (id: string, updates: Partial<Employee>): Promise<Employee> => { /* generated */ },
  remove: (id: string): Promise<void> => { /* generated */ }
};`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// Generated mock handlers for MSW
export const employeeHandlers = [
  http.get('/api/employees', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const department = url.searchParams.get('department');
    
    let employees = mockEmployees;
    if (search) {
      employees = employees.filter(emp => 
        emp.name.includes(search) || emp.email.includes(search)
      );
    }
    if (department) {
      employees = employees.filter(emp => emp.department === department);
    }
    
    return HttpResponse.json(employees);
  }),
  
  http.patch('/api/employees/:id', async ({ params, request }) => {
    const updates = await request.json();
    const employee = mockEmployees.find(emp => emp.id === params.id);
    return HttpResponse.json({ ...employee, ...updates });
  })
];`}
                </Typography>
              </Paper>
            </TabPanel>
          </Box>
          
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            ✅ <strong>Principle Applied:</strong> Contract-driven development ensures frontend and backend teams can work in parallel.
          </Typography>
        </Box>
      ),
    },
    {
      label: "2. Define Permissions",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Permission-Based Access Setup
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Next, we define the permission structure. This shows <strong>Permission-Based Access</strong> as a core architectural principle.
          </Typography>
          
          <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100", mb: 3 }}>
            <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/src/permissions.ts
import { createPermissionDefinitions } from "@smbc/applet-core";

export default createPermissionDefinitions({
  VIEW_EMPLOYEES: {
    name: "View Employees",
    description: "Can view employee directory",
  },
  EDIT_EMPLOYEES: {
    name: "Edit Employees", 
    description: "Can edit employee information",
  },
  MANAGE_EMPLOYEES: {
    name: "Manage Employees",
    description: "Can add/remove employees",
  },
} as const);

// Role mappings (configured by host)
export const defaultRoleMappings = {
  "employee-directory": {
    VIEW_EMPLOYEES: ["Employee", "Manager", "Admin"],
    EDIT_EMPLOYEES: ["Manager", "Admin"],
    MANAGE_EMPLOYEES: ["Admin"]
  }
};`}
            </Typography>
          </Paper>
          
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            ✅ <strong>Principle Applied:</strong> Security is built into the architecture from the start, not added later.
          </Typography>
        </Box>
      ),
    },
    {
      label: "3. Create Component Structure",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Standard Interface Implementation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Now we create the React component following the <strong>Standard Interface</strong> pattern.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="index.ts" />
              <Tab label="Applet.tsx" />
              <Tab label="navigation.ts" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/src/index.ts - Standard Interface Export
import { Applet } from "./Applet";
import permissions from "./permissions";
import { getHostNavigation } from "./navigation";
import apiSpec from "../api/tsp-output/@typespec/openapi3/openapi.json";
import packageJson from "../package.json";

// Every applet exports this exact default export structure
export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Employee Directory API",
    spec: apiSpec,
  },
  getHostNavigation,
  version: packageJson.version,
};`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/src/Applet.tsx
import React from "react";
import { Box } from "@mui/material";
import { useHashNavigation } from "@smbc/applet-core";
import { EmployeeList } from "./components/EmployeeList";
import { EmployeeForm } from "./components/EmployeeForm";

interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);

  const renderCurrentRoute = () => {
    if (currentPath.startsWith("/edit/")) {
      const employeeId = currentPath.replace("/edit/", "");
      return <EmployeeForm employeeId={employeeId} onSave={() => navigateTo("/")} />;
    }
    
    if (currentPath === "/new") {
      return <EmployeeForm onSave={() => navigateTo("/")} />;
    }
    
    // Default to employee list
    return (
      <EmployeeList 
        onEditEmployee={(id) => navigateTo(\`/edit/\${id}\`)}
        onAddEmployee={() => navigateTo("/new")}
      />
    );
  };

  return <Box>{renderCurrentRoute()}</Box>;
};`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/src/navigation.ts
import { createNavigationExport } from "@smbc/applet-core";
import permissions from "./permissions";

const routes = [
  {
    path: "/",
    label: "Employee Directory",
    permission: permissions.VIEW_EMPLOYEES,
  },
  {
    path: "/new",
    label: "Add Employee", 
    permission: permissions.MANAGE_EMPLOYEES,
  },
];

export const getHostNavigation = createNavigationExport({
  routes,
  homeRoute: { label: "Employees", icon: "👥" },
});`}
                </Typography>
              </Paper>
            </TabPanel>
          </Box>
          
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            ✅ <strong>Principle Applied:</strong> Standard interface means any host can integrate this applet without custom code.
          </Typography>
        </Box>
      ),
    },
    {
      label: "4. Implement Data Views",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hash-Based Navigation in Practice
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The employee list component demonstrates <strong>Hash-Based Navigation</strong> with filters and state persistence.
          </Typography>
          
          <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100", mb: 3 }}>
            <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// employee-directory/src/components/EmployeeList.tsx
import { useHashParams } from "@smbc/applet-core";
import { MuiDataView } from "@smbc/mui-applet-core";
import { EmployeeAPI } from "../api/generated";

export const EmployeeList: React.FC = () => {
  const { filters, setFilters } = useHashParams({
    search: "",
    department: "",
    active: undefined,
  });

  return (
    <MuiDataView
      config={{
        entityName: "employees",
        apiEndpoint: "/api/employees",
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { key: "department", label: "Department" },
          { key: "role", label: "Role" },
          { key: "active", label: "Active", type: "boolean" },
        ],
        filters: {
          fields: [
            { name: "search", type: "search", label: "Search employees" },
            { 
              name: "department", 
              type: "select", 
              options: [
                { label: "All", value: "" },
                { label: "Engineering", value: "engineering" },
                { label: "Sales", value: "sales" },
                { label: "Marketing", value: "marketing" },
              ]
            },
            { name: "active", type: "boolean", label: "Active only" },
          ],
          values: filters,
          onChange: setFilters,
        },
        actions: {
          row: [
            { 
              key: "edit", 
              label: "Edit",
              requiredPermissions: ["EDIT_EMPLOYEES"],
              onClick: (employee) => navigate(\`/edit/\${employee.id}\`)
            },
          ],
          bulk: [
            {
              key: "deactivate",
              label: "Deactivate Selected", 
              requiredPermissions: ["EDIT_EMPLOYEES"],
              onClick: async (employees) => {
                // Optimistic update implementation
                return Promise.all(
                  employees.map(emp => 
                    EmployeeAPI.update(emp.id, { active: false })
                  )
                );
              }
            }
          ]
        }
      }}
    />
  );
};`}
            </Typography>
          </Paper>
          
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            ✅ <strong>Principle Applied:</strong> URL state like <code>#/employees?search=john&department=engineering</code> is bookmarkable and shareable.
          </Typography>
        </Box>
      ),
    },
    {
      label: "5. Host Integration",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Self-Contained Deployment
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The final step shows how the applet is <strong>Self-Contained</strong> and <strong>Plugs In Anywhere</strong>.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Host Setup" />
              <Tab label="Permission Config" />
              <Tab label="Runtime" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// In any host application
import { applet as employeeDirectory } from "@bank/employee-directory";

const appletMounts = [
  {
    id: "employee-directory",
    path: "/employees",
    applet: employeeDirectory,
    version: "1.2.0"
  }
];

// Host automatically gets:
// - Navigation structure
// - Permission requirements  
// - API specification
// - Mock service handlers`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// Host configures role mappings
const permissionMappings = {
  "employee-directory": {
    VIEW_EMPLOYEES: ["Employee", "Manager", "Admin"],
    EDIT_EMPLOYEES: ["Manager", "Admin"], 
    MANAGE_EMPLOYEES: ["Admin"]
  }
};

// Navigation automatically adapts based on user roles
const userWithEmployeeRole = {
  id: "user123",
  roles: ["Employee"],
  // Will only see: Employee Directory (read-only)
};

const userWithManagerRole = {
  id: "user456", 
  roles: ["Manager"],
  // Will see: Employee Directory + Edit capabilities
};`}
                </Typography>
              </Paper>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                <Typography component="pre" variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
{`// At runtime, everything works together:

// 1. User navigates to /employees
// 2. Host checks permissions → user has VIEW_EMPLOYEES  
// 3. Applet renders with hash navigation: 
//    #/employees?search=john&department=engineering
// 4. DataView makes API call with generated types
// 5. MSW intercepts and returns mock data (in dev)
// 6. User sees filtered results instantly
// 7. Actions are permission-filtered automatically
// 8. State persists across page refreshes

// URL becomes: 
// https://bank-portal.com/employees#/?search=john&department=engineering&active=true

// This URL is:
// ✅ Bookmarkable
// ✅ Shareable  
// ✅ Preserves all state
// ✅ Works across browser sessions`}
                </Typography>
              </Paper>
            </TabPanel>
          </Box>
          
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            ✅ <strong>All Principles Applied:</strong> The applet is fully self-contained, secure, navigable, and integrates seamlessly.
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Building an Applet: From Concept to Production
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, maxWidth: "800px" }}>
        This walkthrough demonstrates how all architectural principles work together in practice.
        We'll build a simple Employee Directory applet, showing how each step reinforces the core concepts.
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? "Finish" : "Continue"}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Architecture in Action
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This walkthrough demonstrated all four architectural principles working together:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><strong>Standard Interface:</strong> Same export pattern enables any host integration</li>
            <li><strong>Permission-Based Access:</strong> Security woven throughout the development process</li>
            <li><strong>Hash-Based Navigation:</strong> Deep linking and state persistence built-in</li>
            <li><strong>API-First Design:</strong> Contract-driven development enables parallel work</li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            The result is a modular, secure, and maintainable business application that integrates seamlessly into any host system.
          </Typography>
          <Button onClick={handleReset} sx={{ mt: 2 }}>
            Reset Walkthrough
          </Button>
        </Paper>
      )}
    </Box>
  );
};