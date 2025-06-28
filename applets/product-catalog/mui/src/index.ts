import { Applet } from "./components/Applet";
import { PRODUCT_CATALOG_PERMISSIONS } from "./permissions";
import spec from "@smbc/product-catalog-api";

export default {
  permissions: PRODUCT_CATALOG_PERMISSIONS,
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

// Export types directly from the client
import type { components } from "@smbc/product-catalog-client";
export type Product = components["schemas"]["Product"];
export type ProductList = components["schemas"]["ProductList"];
