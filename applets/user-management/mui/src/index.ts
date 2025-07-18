import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/user-management-api";

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "User Management API",
    spec,
  },
};
