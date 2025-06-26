import React, { FC } from 'react';
import { ProductTable } from './components/ProductTable';
import { PRODUCT_CATALOG_PERMISSIONS } from './permissions';
import spec from '@smbc/product-catalog-api';

// Main applet component for root route
const ProductCatalogApplet: FC = () => {
  return React.createElement(ProductTable);
};

// Standard applet export - this is what host apps should import
const applet = {
  permissions: PRODUCT_CATALOG_PERMISSIONS,
  routes: [
    {
      path: '/',
      label: 'Product Catalog',
      component: ProductCatalogApplet,
    },
  ],
  apiSpec: {
    name: 'Product Catalog API',
    spec,
  },
} as const;

// Export the applet (primary export)
export default applet;

// Export individual components for storybook and custom usage
export { ProductTable } from './components/ProductTable';

// Export types directly from the client
import type { components } from '@smbc/product-catalog-client';
export type Product = components['schemas']['Product'];
export type ProductList = components['schemas']['ProductList'];
