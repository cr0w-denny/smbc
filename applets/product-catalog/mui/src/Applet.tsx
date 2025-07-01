import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  IconButton,
  Alert,
  TablePagination,
} from "@mui/material";
import { Add, Edit, Delete, Inventory } from "@mui/icons-material";
import { LoadingTable, EmptyState, SearchInput } from "@smbc/mui-components";
import { apiClient, type components } from "@smbc/product-catalog-client";
import { commonOperationSchemas, createFilterSpec } from "@smbc/applet-core";
import { Filter } from "@smbc/mui-components";

function AdvancedFilters() {
  // Create the operation schema that matches the Products_list API
  const productsListOperation = commonOperationSchemas.listWithFilters({
    category: { type: "string" },
  });

  const config = {
    // Only show specific fields we want in the UI
    includeFields: ["search", "category"],

    // Override specific field configurations
    fieldOverrides: {
      search: {
        placeholder: "Search products...",
        fullWidth: true,
        debounceMs: 500,
      },
      category: {
        label: "Product Category",
        options: [
          { value: "", label: "All Categories" },
          { value: "electronics", label: "Electronics" },
          { value: "clothing", label: "Clothing" },
          { value: "books", label: "Books" },
          { value: "home", label: "Home & Garden" },
        ],
      },
    },

    // Layout configuration
    layout: {
      direction: "row" as const,
      spacing: 3,
      wrap: true,
    },

    // Hide pagination fields since we handle those separately
    hidePagination: true,
    hideSort: true,
  };

  // Create filter specification from the operation type
  const filterSpec = createFilterSpec(productsListOperation, config);

  return (
    <Filter
      spec={{
        ...filterSpec,
        title: "Product Filters",
        collapsible: true,
        defaultCollapsed: false,
        showFilterCount: true,
      }}
      onFiltersChange={(_filters) => {
        // TODO: Apply filters to the product query
      }}
    />
  );
}

// Define types from the client
type Product = components["schemas"]["Product"];

// Define our own query interface based on what the API accepts
interface ProductsQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

const getStatusChip = (inStock: boolean) => {
  return inStock ? (
    <Chip label="In Stock" color="success" size="small" />
  ) : (
    <Chip label="Out of Stock" color="error" size="small" />
  );
};

export interface ProductTableProps {
  /** Whether to show the create button */
  showCreate?: boolean;
  /** Whether to show edit/delete actions */
  showActions?: boolean;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Initial page size */
  initialPageSize?: number;
  /** Custom handlers - if provided, will override default API calls */
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onCreate?: () => void;
  /** Filter parameters for external filtering */
  searchQuery?: string;
  categoryFilter?: string;
}

export function Applet({
  showCreate = true,
  showActions = true,
  showSearch = true,
  showPagination = true,
  initialPageSize = 10,
  onEdit,
  onDelete,
  onCreate,
  searchQuery,
  categoryFilter,
}: ProductTableProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [internalSearch, setInternalSearch] = useState("");

  // Use external search query if provided, otherwise use internal search
  const effectiveSearch =
    searchQuery !== undefined ? searchQuery : internalSearch;

  // Build query parameters
  const queryParams: ProductsQuery = {
    page: page + 1,
    pageSize,
    ...(effectiveSearch && { search: effectiveSearch }),
    ...(categoryFilter && { category: categoryFilter }),
  };

  // API queries using openapi-react-query
  const {
    data: productsData,
    isLoading,
    error,
  } = apiClient.useQuery("get", "/products", {
    params: {
      query: {
        page: queryParams.page || 1,
        pageSize: queryParams.pageSize || 10,
        ...(queryParams.category && { category: queryParams.category }),
        ...(queryParams.search && { search: queryParams.search }),
      },
    },
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load products. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" component="h2">
          Products
        </Typography>
        <LoadingTable rows={5} columns={6} />
      </Box>
    );
  }

  const products = productsData?.products || [];
  const total = productsData?.total || 0;

  return (
    <Box>
      <AdvancedFilters />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {showCreate && onCreate && (
          <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
            Add Product
          </Button>
        )}
      </Box>
      {showSearch && searchQuery === undefined && (
        <Box mb={2}>
          <SearchInput
            value={internalSearch}
            onChange={setInternalSearch}
            placeholder="Search products by name, SKU, or description..."
            fullWidth
          />
        </Box>
      )}
      {products.length === 0 ? (
        <EmptyState
          icon={<Inventory sx={{ fontSize: 64, color: "text.secondary" }} />}
          title={effectiveSearch ? "No products found" : "No products yet"}
          description={
            effectiveSearch
              ? "Try adjusting your search criteria to find products."
              : "Get started by adding your first product to the catalog."
          }
          type={effectiveSearch ? "search" : "create"}
          primaryAction={
            showCreate && onCreate
              ? {
                  label: "Add Product",
                  onClick: onCreate,
                }
              : undefined
          }
          secondaryAction={
            effectiveSearch && searchQuery === undefined
              ? {
                  label: "Clear Search",
                  onClick: () => setInternalSearch(""),
                  variant: "outlined",
                }
              : undefined
          }
        />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="product table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                  {showActions && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow
                    key={product.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
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
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">
                      ${Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusChip(product.inStock)}</TableCell>
                    {showActions && (
                      <TableCell align="right">
                        {onEdit && (
                          <IconButton
                            onClick={() => onEdit(product)}
                            size="small"
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            onClick={() => onDelete(product.id)}
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {showPagination && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </>
      )}
    </Box>
  );
}
