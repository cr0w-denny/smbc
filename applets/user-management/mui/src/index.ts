import { UserTable } from "./components/UserTable";
import { UserProfile } from "./components/UserProfile";
import { Applet } from "./components/Applet";
import { USER_MANAGEMENT_PERMISSIONS } from "./permissions";
import spec from "@smbc/user-management-api";

export default {
  permissions: USER_MANAGEMENT_PERMISSIONS,
  routes: [
    {
      path: "/",
      label: "User Management",
      component: UserTable,
    },
    {
      path: "/profile",
      label: "User Profile",
      component: UserProfile,
    },
  ],
  component: Applet,
  apiSpec: {
    name: "User Management API",
    spec,
  },
};
