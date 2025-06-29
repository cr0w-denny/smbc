import { definePermissions } from "@smbc/applet-core";

/**
 * Product Catalog Applet Permissions
 */
export default definePermissions(
  "product-catalog",
  {
    VIEW_PRODUCTS: "Can view product listings",
    CREATE_PRODUCTS: "Can add new products",
    EDIT_PRODUCTS: "Can modify product information",
    DELETE_PRODUCTS: "Can remove products",
    MANAGE_CATEGORIES: "Can manage product categories",
    VIEW_INVENTORY: "Can view inventory levels",
    MANAGE_PRICING: "Can set and modify product pricing",
  },
);