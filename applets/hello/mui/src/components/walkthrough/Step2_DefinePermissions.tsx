import React from "react";
import { Box, Typography } from "@mui/material";
import { CodeHighlight } from "../CodeHighlight";

export const Step2_DefinePermissions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Permission-Based Access Setup
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Next, we define the permission structure. This shows{" "}
        <strong>Permission-Based Access</strong> as a core architectural
        principle.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontWeight: "bold", mb: 1 }}
        >
          employee-directory/mui/src/permissions.ts
        </Typography>
        <CodeHighlight
          code={`
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
});`}
          language="typescript"
        />
      </Box>

      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.secondary" }}
      >
        ✅ <strong>Principle Applied:</strong> Security is built into the
        architecture from the start, not added later.
      </Typography>
    </Box>
  );
};
