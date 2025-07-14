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
      id={`step1-tabpanel-${index}`}
      aria-labelledby={`step1-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface CodeBlockProps {
  filename: string;
  children: string;
  language?: string;
}

function CodeBlock({
  filename,
  children,
  language = "typescript",
}: CodeBlockProps) {
  return (
    <Box>
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

export const Step1_DefineAPI: React.FC = () => {
  const [setupTabValue, setSetupTabValue] = useState(0);
  const [apiTabValue, setApiTabValue] = useState(0);

  const handleSetupTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setSetupTabValue(newValue);
  };

  const handleApiTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setApiTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Start with TypeSpec Definition
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Before writing any code, we define our data contract. This demonstrates
        the <strong>API-First Design</strong> principle in action.
      </Typography>

      {/* Project Setup Files */}
      <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
        📁 Project Structure & Configuration
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Create the complete API project structure in{" "}
        <code>applets/employee-directory/</code>
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Tabs value={setupTabValue} onChange={handleSetupTabChange}>
          <Tab label="package.json" />
          <Tab label="tspconfig.yaml" />
          <Tab label="MUI package.json" />
          <Tab label="vite.config.ts" />
          <Tab label="tsconfig.json" />
        </Tabs>

        <TabPanel value={setupTabValue} index={0}>
          <CodeBlock
            filename="applets/employee-directory/api/package.json"
            language="json"
          >
            {`{
  "name": "@smbc/employee-directory-api",
  "version": "0.0.0",
  "description": "TypeSpec API definition for employee directory",
  "main": "tsp-output/@typespec/openapi3/openapi.json",
  "type": "module",
  "scripts": {
    "build": "tsp compile .",
    "generate:types": "openapi-typescript tsp-output/@typespec/openapi3/openapi.json -o generated/types.ts",
    "generate:mocks": "../../../scripts/mock-generation/generate.ts --input tsp-output/@typespec/openapi3/openapi.json --output ../../../packages/applet-devtools/src/mocks/employee-directory.ts --base-url /api/v1/employee-directory",
    "generate:all": "npm run generate:types && npm run generate:mocks"
  },
  "dependencies": {
    "@typespec/compiler": "^1.1.0",
    "@typespec/http": "^1.1.0",
    "@typespec/openapi3": "^1.1.0",
    "@typespec/rest": "^0.71.0"
  },
  "devDependencies": {
    "openapi-typescript": "^7.0.0",
    "typescript": "^5.3.3"
  }
}`}
          </CodeBlock>
        </TabPanel>

        <TabPanel value={setupTabValue} index={1}>
          <CodeBlock
            filename="applets/employee-directory/api/tspconfig.yaml"
            language="yaml"
          >
            {`emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    output-file: "openapi.json"`}
          </CodeBlock>
        </TabPanel>

        <TabPanel value={setupTabValue} index={2}>
          <CodeBlock
            filename="applets/employee-directory/mui/package.json"
            language="json"
          >
            {`{
  "name": "@smbc/employee-directory-mui",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "dev": "vite build --watch",
    "build": "tsc && vite build",
    "typecheck": "tsc"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@smbc/applet-core": "*",
    "@smbc/mui-applet-core": "*",
    "@smbc/employee-directory-api": "*",
    "@mui/material": "^7.1.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.3"
  }
}`}
          </CodeBlock>
        </TabPanel>

        <TabPanel value={setupTabValue} index={3}>
          <CodeBlock filename="applets/employee-directory/mui/vite.config.ts">
            {`import { defineConfig } from "vite";
import { createAppletConfig } from "@smbc/vite-config";

export default defineConfig(
  createAppletConfig({
    appletName: "employee-directory-mui",
    rootDir: __dirname,
  }),
);`}
          </CodeBlock>
        </TabPanel>

        <TabPanel value={setupTabValue} index={4}>
          <CodeBlock filename="applets/employee-directory/mui/tsconfig.json">
            {`{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}`}
          </CodeBlock>
        </TabPanel>
      </Box>

      {/* API Definition Files */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        🔗 API Definition & Generated Code
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Define the TypeSpec schema and see what gets generated automatically
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={apiTabValue} onChange={handleApiTabChange}>
          <Tab label="main.tsp" />
        </Tabs>

        <TabPanel value={apiTabValue} index={0}>
          <CodeBlock filename="applets/employee-directory/api/main.tsp">
            {`import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * Employee Directory API
 * 
 * This API provides endpoints for managing employee information.
 */
@service(#{
  title: "Employee Directory API",
})
@server("https://api.smbcgroup.com/api/v1/employee-directory", "Production server")
@server("http://localhost:3001/api/v1/employee-directory", "Development server") 
@server("http://localhost:3000/api/v1/employee-directory", "Mock server")
namespace EmployeeDirectory;

model Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
}

model UpdateEmployeeRequest {
  name?: string;
  email?: string;
  department?: string;
  role?: string;
  active?: boolean;
}

@route("/employees")
interface Employees {
  @get
  list(
    @query search?: string,
    @query department?: string,
    @query active?: boolean,
    @query page?: int32,
    @query pageSize?: int32
  ): Employee[];
  
  @get
  @route("/{id}")
  read(@path id: string): Employee;
  
  @post
  create(@body employee: Employee): Employee;
  
  @patch(#{implicitOptionality: true})
  @route("/{id}")
  update(@path id: string, @body updates: UpdateEmployeeRequest): Employee;
  
  @delete
  @route("/{id}")
  remove(@path id: string): void;
}`}
          </CodeBlock>
        </TabPanel>
      </Box>

      {/* Generated Output Summary */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: "info.main",
          color: "info.contrastText",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          💡 What Gets Generated:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
          • <strong>TypeScript Types</strong> - Complete type definitions for
          Employee, API parameters, and responses
          <br />• <strong>OpenAPI Spec</strong> - Industry standard API
          documentation
          <br />• <strong>Mock Service Workers</strong> - Realistic mock
          handlers with pagination, filtering, and error simulation
          <br />• <strong>API Clients</strong> - Type-safe HTTP client functions
          ready to use
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary", mt: 2 }}
      >
        ✅ <strong>Principle Applied:</strong> Contract-driven development
        ensures frontend and backend teams can work in parallel.
      </Typography>

      <Box
        sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          Build and Generate:
        </Typography>
        <CodeBlock filename="Terminal Commands" language="bash">
          {`# Navigate to API directory
cd applets/employee-directory/api

# Install dependencies  
npm install

# Build TypeSpec and generate artifacts
npm run build
npm run generate:all

# This creates:
# ✅ OpenAPI spec: tsp-output/@typespec/openapi3/openapi.json
# ✅ TypeScript types: generated/types.ts  
# ✅ Mock handlers: ../../../packages/applet-devtools/src/mocks/employee-directory.ts`}
        </CodeBlock>
      </Box>
    </Box>
  );
};
