import React from "react";
import {
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import { usePermissions } from "@smbc/applet-core";
import permissions from "../../../permissions";
import { CodeHighlight } from "../../CodeHighlight";

const CodeExample: React.FC = () => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2 }}>
      1. Define Permissions
    </Typography>
    <CodeHighlight
      language="typescript"
      code={`// permissions.ts
export default definePermissions('my-applet', {
  VIEW_USERS: 'View user list and details',
  EDIT_USERS: 'Modify user information',
  DELETE_USERS: 'Remove users from system'
});`}
    />

    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
      2. Use in Components
    </Typography>
    <CodeHighlight
      language="tsx"
      code={`import { usePermissions } from "@smbc/applet-core";
import permissions from "./permissions";

function MyApplet() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <h1>User Management</h1>
      {hasPermission('my-applet', permissions.VIEW_USERS) && (
        <UserList />
      )}
      {hasPermission('my-applet', permissions.EDIT_USERS) && (
        <EditUserButton />
      )}
      {hasPermission('my-applet', permissions.DELETE_USERS) && (
        <DeleteUserButton />
      )}
    </div>
  );
}`}
    />

    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
      3. Host Configuration
    </Typography>
    <CodeHighlight
      language="typescript"
      code={`// Host maps permissions to roles
const roleConfig = {
  roles: ["Guest", "Staff", "Manager", "Admin"],
  permissionMappings: {
    "my-applet": {
      "my-applet:view-users": ["Staff"],    // Staff and above
      "my-applet:edit-users": ["Manager"],  // Manager and above  
      "my-applet:delete-users": ["Admin"]   // Admin only
    }
  }
};`}
    />
  </Box>
);

const LiveDemo: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Permission System Demo
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            This demonstrates hierarchical role-based permissions where higher
            roles automatically inherit lower role permissions.
          </Typography>

          <Box sx={{ display: "grid", gap: 2 }}>
            {hasPermission("hello", permissions.VIEW_ROUTE_ONE) && (
              <Alert severity="info">
                ✅ <strong>VIEW_ROUTE_ONE</strong> - You can view basic content
              </Alert>
            )}

            {!hasPermission("hello", permissions.VIEW_ROUTE_ONE) && (
              <Alert severity="warning">
                ❌ <strong>VIEW_ROUTE_ONE</strong> - Basic view access denied
              </Alert>
            )}

            {hasPermission("hello", permissions.VIEW_ROUTE_TWO) && (
              <Alert severity="success">
                ✅ <strong>VIEW_ROUTE_TWO</strong> - You can access advanced
                features
              </Alert>
            )}

            {!hasPermission("hello", permissions.VIEW_ROUTE_TWO) && (
              <Alert severity="error">
                ❌ <strong>VIEW_ROUTE_TWO</strong> - Advanced features require
                higher role
              </Alert>
            )}

            {hasPermission("hello", permissions.VIEW_ROUTE_THREE) && (
              <Alert severity="success">
                ✅ <strong>VIEW_ROUTE_THREE</strong> - You have deployment
                access
              </Alert>
            )}

            {!hasPermission("hello", permissions.VIEW_ROUTE_THREE) && (
              <Alert severity="error">
                ❌ <strong>VIEW_ROUTE_THREE</strong> - Deployment requires admin
                role
              </Alert>
            )}

            {hasPermission("hello", permissions.VIEW_ROUTE_FOUR) && (
              <Alert severity="success">
                ✅ <strong>VIEW_ROUTE_FOUR</strong> - You have integration
                access
              </Alert>
            )}

            {!hasPermission("hello", permissions.VIEW_ROUTE_FOUR) && (
              <Alert severity="error">
                ❌ <strong>VIEW_ROUTE_FOUR</strong> - Integration requires
                highest privileges
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How Permission Inheritance Works
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Roles are hierarchical - higher roles automatically inherit all
            permissions from lower roles:
          </Typography>

          <CodeHighlight
            language="text"
            showCopyButton={false}
            code={`Guest → Customer → Staff → Manager → Admin

• Guest: Basic access only
• Customer: Guest + customer features  
• Staff: Customer + internal tools
• Manager: Staff + management features
• Admin: Manager + system administration

Permission check:
userRoleIndex >= requiredRoleIndex`}
          />

          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            💡 A Manager automatically has all Staff, Customer, and Guest
            permissions without explicit mapping.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export const PermissionsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    { label: "Code", content: <CodeExample /> },
    { label: "Demo", content: <LiveDemo /> },
  ];

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
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
