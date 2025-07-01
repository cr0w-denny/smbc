import { definePermissions } from "@smbc/applet-core";

/**
 * User Management Applet Permissions
 *
 * Defines all permissions required for user management operations.
 * These permissions integrate with the SMBC permission system to
 * control access to various user management features.
 */
export default definePermissions("user-management", {
  /** Permission to view user list and individual user profiles */
  VIEW_USERS: "Can view user list and profiles",

  /** Permission to create new user accounts in the system */
  CREATE_USERS: "Can create new user accounts",

  /** Permission to modify existing user information and settings */
  EDIT_USERS: "Can modify existing user information",

  /** Permission to remove user accounts from the system */
  DELETE_USERS: "Can remove user accounts",

  /** Permission to assign and modify user roles and permissions */
  MANAGE_ROLES: "Can assign and modify user roles",

  /** Permission to view user analytics, reports, and usage statistics */
  VIEW_ANALYTICS: "Can view user analytics and reports",
});
