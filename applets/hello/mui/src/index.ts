import { Applet } from "./Applet";
import permissions from "./permissions";
import { getHostNavigation } from "./navigation";

export default {
  permissions,
  routes: [
    {
      path: "/",
      label: "Hello",
      component: Applet,
    },
  ],
  component: Applet,
  getHostNavigation,
};
