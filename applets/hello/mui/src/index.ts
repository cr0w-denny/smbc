import { Applet } from "./Applet";
import permissions from "./permissions";
import { getHostNavigation } from "./navigation";
import packageJson from "../package.json";

export default {
  permissions,
  component: Applet,
  getHostNavigation,
  version: packageJson.version,
};
