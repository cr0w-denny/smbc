// employee-directory/src/index.ts - Standard Interface Export
import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/employee-directory-api";

// Every applet exports this exact default export structure
export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Employee Directory API",
    spec,
  },
};