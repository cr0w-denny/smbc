import React from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { CodeHighlight } from "../../CodeHighlight";

interface DataViewDemoProps {
  mode: "optimistic" | "transaction";
}

const OptimisticCodeExample: React.FC = () => (
  <CodeHighlight
    language="tsx"
    code={`import { MuiDataViewApplet, type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import { getApiClient } from "@smbc/applet-core";
import { createOptimisticBulkUpdateAction } from "@smbc/dataview";
import type { paths, components } from "@smbc/product-catalog-api/types";

type Product = components["schemas"]["Product"];

function OptimisticProductCatalog() {
  const apiClient = getApiClient<paths>("product-catalog");
  
  const config: MuiDataViewAppletConfig<Product> = {
    api: {
      client: apiClient,
      endpoint: "/products",
      responseRow: (response: any) => response?.products || [],
      responseRowCount: (response: any) => response?.total || 0,
      formatCacheUpdate: (originalResponse: any, newRows: Product[]) => ({
        ...originalResponse,
        products: newRows,
        total: originalResponse.total,
      }),
    },
    schema: {
      primaryKey: "id",
      fields: {
        name: { type: "text", required: true },
        price: { type: "number", required: true },
        active: { type: "boolean", default: true },
      },
    },
    columns: [
      { key: "name", label: "Product Name", sortable: true },
      { key: "price", label: "Price", type: "currency", sortable: true },
      { key: "active", label: "Status", type: "boolean", sortable: true },
    ],
    filters: {
      fields: [
        { name: "search", label: "Search", type: "search", fullWidth: true },
        { name: "active", label: "Status", type: "select", options: [
          { label: "All", value: "" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ]},
      ],
      initialValues: { search: "", active: "" },
    },
    actions: {
      bulk: [
        createOptimisticBulkUpdateAction<Product>(
          async (id: string, data: Partial<Product>) => {
            const result = await apiClient.PATCH("/products/{id}", {
              params: { path: { id } },
              body: data,
            });
            return result.data || {};
          },
          { active: true },
          { key: "activate", label: "Activate Selected", color: "success" }
        ),
      ],
    },
    forms: {
      create: {
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true },
          { name: "price", label: "Price", type: "number", required: true },
          { name: "active", label: "Active", type: "boolean", default: true },
        ],
      },
      edit: {
        fields: [
          { name: "name", label: "Product Name", type: "text", required: true },
          { name: "price", label: "Price", type: "number", required: true },
          { name: "active", label: "Active", type: "boolean" },
        ],
      },
    },
    pagination: { enabled: true, defaultPageSize: 10 },
    activity: { enabled: true },
  };

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="product-catalog"
      // No transaction options = optimistic mode (default)
      onSuccess={(action, item) => console.log(\`\${action} successful\`, item)}
      onError={(action, error) => console.error(\`\${action} failed\`, error)}
    />
  );
}`}
  />
);

const TransactionCodeExample: React.FC = () => (
  <CodeHighlight
    language="tsx"
    code={`import { MuiDataViewApplet, type MuiDataViewAppletConfig } from "@smbc/mui-applet-core";
import { getApiClient } from "@smbc/applet-core";
import { createBulkUpdateAction, createBulkDeleteAction } from "@smbc/dataview";
import type { paths, components } from "@smbc/employee-directory-api/types";

type Employee = components["schemas"]["Employee"];

function EmployeeDirectoryWithTransactions() {
  const apiClient = getApiClient<paths>("employee-directory");
  
  const config: MuiDataViewAppletConfig<Employee> = {
    api: {
      client: apiClient,
      endpoint: "/employees",
      responseRow: (response: any) => response?.employees || [],
      responseRowCount: (response: any) => response?.total || 0,
      formatCacheUpdate: (originalResponse: any, newRows: Employee[]) => ({
        ...originalResponse,
        employees: newRows,
        total: originalResponse.total,
      }),
    },
    schema: {
      primaryKey: "id",
      fields: {
        name: { type: "text", required: true },
        email: { type: "email", required: true },
        department: { type: "text", required: true },
        role: { type: "text", required: true },
        active: { type: "boolean", default: true },
      },
    },
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "department", label: "Department", sortable: true },
      { key: "role", label: "Role", sortable: true },
      { key: "active", label: "Status", type: "boolean", sortable: true },
    ],
    filters: {
      fields: [
        { name: "search", label: "Search", type: "search", fullWidth: true },
        { name: "department", label: "Department", type: "select", options: [
          { label: "All", value: "" },
          { label: "Engineering", value: "engineering" },
          { label: "Sales", value: "sales" },
          { label: "Marketing", value: "marketing" },
        ]},
        { name: "active", label: "Status", type: "select", options: [
          { label: "All", value: "" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ]},
      ],
      initialValues: { search: "", department: "", active: "" },
    },
    actions: {
      bulk: [
        createBulkUpdateAction<Employee>(
          async (id: string, data: Partial<Employee>) => {
            const result = await apiClient.PATCH("/employees/{id}", {
              params: { path: { id } },
              body: data,
            });
            if (!result.data) throw new Error("Failed to update employee");
            return result.data;
          },
          { active: true },
          { key: "activate", label: "Activate Selected", color: "success" }
        ),
        createBulkDeleteAction<Employee>(
          async (id: string) => {
            const result = await apiClient.DELETE("/employees/{id}", {
              params: { path: { id } },
            });
            if (!result.data) throw new Error("Failed to delete employee");
            return result.data;
          },
          { key: "delete", label: "Delete Selected", color: "error" }
        ),
      ],
    },
    forms: {
      create: {
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "department", label: "Department", type: "text", required: true },
          { name: "role", label: "Role", type: "text", required: true },
          { name: "active", label: "Active", type: "boolean", default: true },
        ],
      },
      edit: {
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "department", label: "Department", type: "text", required: true },
          { name: "role", label: "Role", type: "text", required: true },
          { name: "active", label: "Active", type: "boolean" },
        ],
      },
    },
    pagination: { enabled: true, defaultPageSize: 10 },
    activity: { enabled: true },
  };

  return (
    <MuiDataViewApplet
      config={config}
      permissionContext="employee-directory"
      options={{
        transaction: {
          enabled: true,              // Enable transaction mode
          requireConfirmation: true,  // Show review dialog before commit
          allowPartialSuccess: true,  // Allow some operations to succeed
          emitActivities: true,       // Track individual operations
        },
      }}
      onSuccess={(action, item) => console.log(\`\${action} successful\`, item)}
      onError={(action, error) => console.error(\`\${action} failed\`, error)}
    />
  );
}`}
  />
);

export const DataViewDemo: React.FC<DataViewDemoProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    {
      label: "Code",
      content:
        mode === "optimistic" ? (
          <OptimisticCodeExample />
        ) : (
          <TransactionCodeExample />
        ),
    },
    {
      label: "Demo",
      content: (
        <Typography
          variant="body2"
          sx={{ p: 2, fontStyle: "italic", color: "text.secondary" }}
        >
          TODO: Interactive demo coming soon
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>

      {tabs[activeTab]?.content}
    </Box>
  );
};
