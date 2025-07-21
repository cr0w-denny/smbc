/**
 * Filter configuration for the Product Catalog
 */

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
      type: "search",
      label: "Search products...",
      placeholder: "Search by name, SKU, or description...",
      fullWidth: true,
    },
    {
      name: "category",
      type: "select",
      label: "Category",
      options: PRODUCT_CATEGORIES,
    },
    {
      name: "inStock",
      type: "boolean",
      label: "In stock only",
      defaultValue: false,
    },
  ],
  initialValues: {
    search: "",
    category: undefined,
    inStock: false,
  },
  title: "Product Filters",
  collapsible: true,
  defaultCollapsed: false,
  showClearButton: true,
  showFilterCount: true,
  debounceMs: 300,
});
