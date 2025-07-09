/**
 * Pure Custom Applet Implementation
 * 
 * This demonstrates a completely custom applet that doesn't use the dataview framework.
 * It shows how you can build any UI you want using just:
 * - Raw OpenAPI-generated client
 * - Custom React components  
 * - Manual state management
 * - Custom business logic
 * 
 * As long as you respect the applet export format (permissions, routes, apiSpec),
 * you have complete freedom in implementation.
 * 
 * Benefits:
 * - Complete control over UI/UX
 * - Custom business logic
 * - No framework constraints
 * - Can integrate any third-party components
 * 
 * Trade-offs:
 * - More code to write and maintain
 * - No built-in transactions, bulk actions, activity tracking
 * - Need to implement common patterns manually
 */
import React, { useCallback } from "react";
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
import { LoadingTable, EmptyState, Filter } from "@smbc/mui-components";
import type { components, paths } from "@smbc/product-catalog-api/generated/types";
import { useHashParams, getApiClient } from "@smbc/applet-core";
import { useQuery } from "@tanstack/react-query";
import { createProductFiltersConfig, transformProductFilters } from "./config/filters";

// Define types from the client
type Product = components["schemas"]["Product"];

// Define our own query interface based on what the API accepts
interface ProductsQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  inStock?: boolean;
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
  // URL state sync for filters and pagination
  const { filters, setFilters, pagination, setPagination } = useHashParams(
    { 
      search: searchQuery || "",
      category: categoryFilter || "",
      inStock: undefined,
    },
    { 
      page: 0, 
      pageSize: initialPageSize 
    },
    true, // enabled
    "products" // namespace
  );

  // Use URL-synced search if not overridden by external prop
  const effectiveFilters = React.useMemo(() => ({
    search: searchQuery !== undefined ? searchQuery : filters.search,
    category: categoryFilter !== undefined ? categoryFilter : filters.category,
    inStock: filters.inStock,
  }), [searchQuery, filters.search, categoryFilter, filters.category, filters.inStock]);

  // Filter configuration - stable reference
  const filterConfig = React.useMemo(() => createProductFiltersConfig(), []);

  // Handle filter changes - stable callback
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    // Reset to first page when filtering
    setPagination({ page: 0 });
  }, [setFilters, setPagination]);

  // Always render filter container but conditionally show content
  const filterComponent = (
    <Box mb={2}>
      {(showSearch && searchQuery === undefined) && (
        <Filter 
          key="product-catalog-filter" // Stable key to maintain component identity
          spec={filterConfig}
          values={effectiveFilters}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </Box>
  );

  // Build query parameters using URL state  
  const queryParams: ProductsQuery = React.useMemo(() => {
    const transformedFilters = transformProductFilters(effectiveFilters);
    return {
      page: pagination.page + 1,
      pageSize: pagination.pageSize,
      ...transformedFilters,
    };
  }, [effectiveFilters, pagination.page, pagination.pageSize]);


  // API queries using React Query + openapi-fetch
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const response = await getApiClient<paths>("product-catalog").GET("/products", {
        params: {
          query: {
            page: queryParams.page || 1,
            pageSize: queryParams.pageSize || 10,
            ...(queryParams.category && { category: queryParams.category }),
            ...(queryParams.search && { search: queryParams.search }),
          },
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch products');
      }
      
      return response.data;
    },
  });

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPagination({ page: newPage });
  }, [setPagination]);

  const handleChangeRowsPerPage = useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPagination({ pageSize: newPageSize, page: 0 });
  }, [setPagination]);

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load products. Please try again later.
        </Alert>
      </Box>
    );
  }

  const products = productsData?.products || [];
  const total = productsData?.total || 0;

  return (
    <Box>
      {/* Filter Section - Always render to maintain stable DOM structure */}
      {filterComponent}
      
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

      {/* Loading state within consistent structure */}
      {isLoading && (
        <LoadingTable rows={5} columns={6} />
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error">
          Failed to load products. Please try again later.
        </Alert>
      )}

      {/* Content when loaded and not loading */}
      {!isLoading && !error && (
        products.length === 0 ? (
        <EmptyState
          icon={<Inventory sx={{ fontSize: 64, color: "text.secondary" }} />}
          title={effectiveFilters.search ? "No products found" : "No products yet"}
          description={
            effectiveFilters.search
              ? "Try adjusting your search criteria to find products."
              : "Get started by adding your first product to the catalog."
          }
          type={effectiveFilters.search ? "search" : "create"}
          primaryAction={
            showCreate && onCreate
              ? {
                  label: "Add Product",
                  onClick: onCreate,
                }
              : undefined
          }
          secondaryAction={
            effectiveFilters.search && searchQuery === undefined
              ? {
                  label: "Clear Filters",
                  onClick: () => setFilters({ search: "", category: undefined, inStock: undefined }),
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
                  {showActions && (onEdit || onDelete) && <TableCell align="right">Actions</TableCell>}
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
                    {showActions && (onEdit || onDelete) && (
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
              rowsPerPage={pagination.pageSize}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </>
        )
      )}
    </Box>
  );
}
