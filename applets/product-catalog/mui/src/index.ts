import { ProductCatalogRoutes } from "./routes";
import permissions from "./permissions";
import spec from "@smbc/product-catalog-api";

export default {
  permissions,
  component: ProductCatalogRoutes,
  apiSpec: {
    name: "Product Catalog API",
    spec,
  },
};
