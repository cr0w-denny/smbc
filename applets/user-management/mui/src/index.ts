import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/user-management-api";
import packageJson from "../package.json";

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "User Management API",
    spec,
  },
  version: packageJson.version,
};
