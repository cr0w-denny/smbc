/**
 * This product catalog is using DataView with optimistic updates enabled.
 *
 * Test the error handling: Product #6 will fail and automatically revert.
 */
import {
  MuiDataViewApplet,
  type MuiDataViewAppletConfig,
} from "@smbc/mui-applet-core";
import { Box, Typography, Alert } from "@mui/material";
import { Delete, CheckCircle, ErrorOutline } from "@mui/icons-material";
import { useApiClient } from "@smbc/applet-core";
import type {
  components,
  paths,
} from "@smbc/product-catalog-api/types";
import {
  createOptimisticBulkUpdateAction,
  createOptimisticBulkDeleteAction,
} from "@smbc/react-query-dataview";

type Product = components["schemas"]["Product"];

export function Applet() {
  const apiClient = useApiClient<paths>("product-catalog");

  console.log("DataViewOptimistic: Initializing with apiClient", apiClient);

  const dataViewConfig: MuiDataViewAppletConfig<Product> = {
    // API configuration
    api: {
      client: apiClient,
      endpoint: "/products",

      // Extract data rows from API response
      responseRow: (response: any) => {
        console.log(
          "DataViewOptimistic responseRow: parsing response",
          response,
        );
        return response?.products || [];
      },

      // Extract total count from API response
      responseRowCount: (response: any) => {
        console.log(
          "DataViewOptimistic responseRowCount: parsing response",
          response,
        );
        return response?.total || 0;
      },

      // Format cache updates for both optimistic updates and transaction mode
      formatCacheUpdate: (originalResponse: any, newRows: any[]) => {
        console.log("DataViewOptimistic formatCacheUpdate:", {
          originalResponse,
          newRows,
        });
        return {
          ...originalResponse,
          products: newRows,
          total: originalResponse.total,
        };
      },
    },

    // Schema configuration
    schema: {
      primaryKey: "id",
      displayName: (product) => product.name,
      fields: [
        { name: "name", type: "string", label: "Name", required: true },
        { name: "description", type: "string", label: "Description" },
        { name: "price", type: "number", label: "Price", required: true },
        {
          name: "category",
          type: "select",
          label: "Category",
          required: true,
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "clothing", label: "Clothing" },
            { value: "books", label: "Books" },
            { value: "home", label: "Home & Garden" },
            { value: "sports", label: "Sports & Outdoors" },
          ],
        },
        { name: "sku", type: "string", label: "SKU", required: true },
      ],
    },

    // Column configuration
    columns: [
      {
        key: "name",
        label: "Product",
        render: (product: Product) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {product.name}
            </Typography>
            {product.description && (
              <Typography variant="caption" color="text.secondary">
                {product.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: "sku",
        label: "SKU",
        width: "120px",
      },
      {
        key: "category",
        label: "Category",
        width: "120px",
      },
      {
        key: "price",
        label: "Price",
        width: "100px",
        // align: "right" as const, // TODO: Add align support to DataColumn type
        render: (product: Product) => `$${Number(product.price).toFixed(2)}`,
      },
      {
        key: "inStock",
        label: "Status",
        width: "120px",
        render: (product: Product) => (
          <Box display="flex" alignItems="center" gap={1}>
            {product.inStock ? (
              <>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2" color="success.main">
                  In Stock
                </Typography>
              </>
            ) : (
              <>
                <ErrorOutline color="error" fontSize="small" />
                <Typography variant="body2" color="error.main">
                  Out of Stock
                </Typography>
              </>
            )}
          </Box>
        ),
      },
    ],

    // Filter configuration
    filters: {
      title: "Products",
      fields: [
        {
          name: "search",
          type: "search",
          label: "Search products...",
          placeholder: "Search by name or SKU",
          fullWidth: true,
        },
        {
          name: "category",
          type: "select",
          label: "Category",
          options: [
            { value: "", label: "All Categories" },
            { value: "electronics", label: "Electronics" },
            { value: "clothing", label: "Clothing" },
            { value: "books", label: "Books" },
            { value: "home", label: "Home & Garden" },
            { value: "sports", label: "Sports & Outdoors" },
          ],
        },
        {
          name: "inStock",
          type: "select",
          label: "Stock Status",
          options: [
            { value: "", label: "All Products" },
            { value: "true", label: "In Stock" },
            { value: "false", label: "Out of Stock" },
          ],
        },
      ],
      initialValues: { search: "", category: "", inStock: "" },
    },

    // Pagination configuration
    pagination: {
      enabled: true,
      defaultPageSize: 10,
    },

    // Actions configuration
    actions: {
      bulk: [
        createOptimisticBulkUpdateAction(
          async (_item: Product, updateData: Partial<Product>) => {
            const response = await apiClient.PATCH("/products/{id}", {
              params: { path: { id: _item.id } },
              body: updateData,
            });
            if (response.error) throw new Error(response.error.message);
            return response.data;
          },
          (_item: Product) => ({ inStock: true }),
          {
            key: "mark-in-stock",
            label: "Mark In Stock",
            icon: CheckCircle,
            color: "success",
            appliesTo: (item: Product) => !item.inStock, // Only show for out-of-stock items
          },
        ),
        createOptimisticBulkUpdateAction(
          async (_item: Product, updateData: Partial<Product>) => {
            const response = await apiClient.PATCH("/products/{id}", {
              params: { path: { id: _item.id } },
              body: updateData,
            });
            if (response.error) throw new Error(response.error.message);
            return response.data;
          },
          (_item: Product) => ({ inStock: false }),
          {
            key: "mark-out-of-stock",
            label: "Mark Out of Stock",
            icon: ErrorOutline,
            color: "warning",
            appliesTo: (item: Product) => item.inStock, // Only show for in-stock items
          },
        ),
        createOptimisticBulkDeleteAction(
          async (id: string | number) => {
            const response = await apiClient.DELETE("/products/{id}", {
              params: { path: { id: String(id) } },
            });
            if (response.error)
              throw new Error(
                response.error.message || "Failed to delete product",
              );
            return response.data;
          },
          {
            key: "delete-selected",
            label: "Delete Selected",
            icon: Delete,
          },
        ),
      ],
    },

    // Form configuration
    forms: {
      create: {
        fields: [
          { name: "name", type: "string", label: "Name", required: true },
          { name: "description", type: "string", label: "Description" },
          { name: "price", type: "number", label: "Price", required: true },
          {
            name: "category",
            type: "select",
            label: "Category",
            required: true,
            options: [
              { value: "electronics", label: "Electronics" },
              { value: "clothing", label: "Clothing" },
              { value: "books", label: "Books" },
              { value: "home", label: "Home & Garden" },
              { value: "sports", label: "Sports & Outdoors" },
            ],
          },
          { name: "sku", type: "string", label: "SKU", required: true },
        ],
        title: "Add New Product",
        submitLabel: "Create Product",
      },
      edit: {
        fields: [
          { name: "name", type: "string", label: "Name", required: true },
          { name: "description", type: "string", label: "Description" },
          { name: "price", type: "number", label: "Price", required: true },
          {
            name: "category",
            type: "select",
            label: "Category",
            required: true,
            options: [
              { value: "electronics", label: "Electronics" },
              { value: "clothing", label: "Clothing" },
              { value: "books", label: "Books" },
              { value: "home", label: "Home & Garden" },
              { value: "sports", label: "Sports & Outdoors" },
            ],
          },
          { name: "sku", type: "string", label: "SKU", required: true },
          { name: "inStock", type: "boolean", label: "In Stock" },
        ],
        title: "Edit Product",
        submitLabel: "Update Product",
      },
    },

    // Activity configuration
    activity: {
      enabled: true,
      entityType: "product",
    },
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body1">
          Select products and use bulk actions to see optimistic updates in
          action. Some products may fail and revert while others succeed - check
          the console for details.
        </Typography>
      </Alert>

      <MuiDataViewApplet
        config={dataViewConfig}
        options={{
          // Disable transactions to enable optimistic mode
          transaction: { enabled: false, requireConfirmation: false },
          onSuccess: (action, item) => {
            console.log(
              `✅ Optimistic ${action} succeeded for "${item?.name}":`,
              item,
            );
          },
          onError: (action, error, item) => {
            console.error(
              `❌ Optimistic ${action} failed for "${item?.name}":`,
              error,
              item,
            );
          },
        }}
      />
    </Box>
  );
}
