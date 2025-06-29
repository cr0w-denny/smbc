import { UserManager } from "./UserManager";
import { UserProfile } from "./UserProfile";
import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/user-management-api";

/**
 * User Management MUI Applet
 *
 * A comprehensive applet for managing users with full CRUD operations,
 * advanced filtering, and permission-based access control.
 *
 * @example
 * ```tsx
 * import userManagementApplet from '@smbc/user-management-mui';
 *
 * // Use in applet host
 * <AppletHost applets={[userManagementApplet]} />
 * ```
 */
export default {
  /** Permission definitions for user management operations */
  permissions,

  /** Route configuration for the applet */
  routes: [
    {
      path: "/",
      label: "User Management",
      component: UserManager,
    },
    {
      path: "/profile",
      label: "User Profile",
      component: UserProfile,
    },
  ],

  /** Main applet component */
  component: Applet,

  /** API specification for integration */
  apiSpec: {
    name: "User Management API",
    spec,
  },
};
