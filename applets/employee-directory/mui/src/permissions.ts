import { definePermissions } from "@smbc/applet-core";

/**
 * Employee Directory Applet Permissions
 *
 * Defines all permissions required for employee directory operations.
 * These permissions integrate with the SMBC permission system to
 * control access to various employee management features.
 */
export default definePermissions('employee-directory', {
  /** Permission to view employee list and details */
  VIEW_EMPLOYEES: "Can view employee directory",
  
  /** Permission to modify existing employee information */
  EDIT_EMPLOYEES: "Can edit employee information", 
  
  /** Permission to add or remove employees from the directory */
  MANAGE_EMPLOYEES: "Can add/remove employees",
});