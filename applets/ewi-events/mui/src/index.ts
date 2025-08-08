import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/ewi-events-api";

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "EWI Events API",
    spec,
  },
};
