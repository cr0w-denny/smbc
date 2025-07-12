import { ProductCatalogRoutes } from "./routes";
import permissions from "./permissions";
import spec from "@smbc/product-catalog-api";
import packageJson from "../package.json";

export default {
  permissions,
  component: ProductCatalogRoutes,
  apiSpec: {
    name: "Product Catalog API",
    spec,
  },
  version: packageJson.version,
};
