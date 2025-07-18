import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/usage-stats-api";

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Usage Stats API",
    spec,
  },
};