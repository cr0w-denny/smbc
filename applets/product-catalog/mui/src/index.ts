import { Applet } from "./Applet";
import permissions from "./permissions";
import spec from "@smbc/product-catalog-api";

export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "Product Catalog API",
    spec,
  },
};
