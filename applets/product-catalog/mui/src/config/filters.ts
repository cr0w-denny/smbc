/**
 * Filter configuration for the Product Catalog
 */

// Import types for proper typing
interface ProductsQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  inStock?: boolean;
}

// Product categories - in a real app, these might come from an API
const PRODUCT_CATEGORIES = [
  { label: "All Categories", value: undefined },
  { label: "Electronics", value: "Electronics" },
  { label: "Books", value: "Books" },
  { label: "Clothing", value: "Clothing" },
  { label: "Home", value: "Home" },
  { label: "Sports", value: "Sports" },
  { label: "Beauty", value: "Beauty" },
  { label: "Automotive", value: "Automotive" },
  { label: "Health", value: "Health" },
  { label: "Toys", value: "Toys" },
  { label: "Garden", value: "Garden" },
];

export const createProductFiltersConfig = () => ({
  fields: [
    {
      name: "search",
      type: "search" as const,
      label: "Search products...",
      placeholder: "Search by name, SKU, or description...",
      fullWidth: true,
    },
    {
      name: "category",
      type: "select" as const,
      label: "Category",
      options: PRODUCT_CATEGORIES,
    },
    {
      name: "inStock",
      type: "select" as const,
      label: "Stock Status",
      options: [
        { label: "All Items", value: undefined },
        { label: "In Stock", value: "true" },
        { label: "Out of Stock", value: "false" },
      ],
    },
  ],
  initialValues: {
    search: "",
    category: undefined,
    inStock: undefined,
  },
  title: "Product Filters",
  collapsible: true,
  defaultCollapsed: false,
  showClearButton: true,
  showFilterCount: true,
  debounceMs: 300,
});

/**
 * Filter values interface
 */
interface FilterValues {
  search?: string;
  category?: string;
  inStock?: string;
  [key: string]: unknown;
}

/**
 * Transform filter values for API consumption
 */
export const transformProductFilters = (filters: FilterValues): Partial<ProductsQuery> => {
  const transformed: any = { ...filters };

  // Convert inStock string to boolean for API
  if (transformed.inStock === "true") {
    transformed.inStock = true;
  } else if (transformed.inStock === "false") {
    transformed.inStock = false;
  } else {
    delete transformed.inStock;
  }

  // Remove empty search
  if (!transformed.search) {
    delete transformed.search;
  }

  // Remove undefined category
  if (!transformed.category) {
    delete transformed.category;
  }

  return transformed;
};