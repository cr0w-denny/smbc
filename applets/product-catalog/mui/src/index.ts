import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/product-catalog-api";

export default {
  permissions,
  routes: [
    {
      path: "/",
      label: "Product Catalog",
      component: Applet,
    },
  ],
  apiSpec: {
    name: "Product Catalog API",
    spec,
  },
};
