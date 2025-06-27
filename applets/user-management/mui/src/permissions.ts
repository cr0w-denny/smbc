// User Management Applet Permissions
import { definePermissions } from "@smbc/applet-core";

export const USER_MANAGEMENT_PERMISSIONS = definePermissions(
  "user-management",
  {
    VIEW_USERS: "Can view user list and profiles",
    CREATE_USERS: "Can create new user accounts",
    EDIT_USERS: "Can modify existing user information",
    DELETE_USERS: "Can remove user accounts",
    MANAGE_ROLES: "Can assign and modify user roles",
    VIEW_ANALYTICS: "Can view user analytics and reports",
  },
);
