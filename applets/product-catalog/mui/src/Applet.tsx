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
import { LoadingTable, EmptyState, SearchInput } from "@smbc/mui-components";
import { apiClient, type components } from "@smbc/product-catalog-client";
import { useHashParams } from "@smbc/applet-core";
import { useQuery } from "@tanstack/react-query";

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
  // URL state sync for filters and pagination
  const { filters, setFilters, pagination, setPagination } = useHashParams(
    { 
      search: searchQuery || "",
      category: categoryFilter || "",
    },
    { 
      page: 0, 
      pageSize: initialPageSize 
    },
    true, // enabled
    "products" // namespace
  );

  // Use URL-synced search if not overridden by external prop
  const effectiveSearch = React.useMemo(() => 
    searchQuery !== undefined ? searchQuery : filters.search
  , [searchQuery, filters.search]);
  const effectiveCategory = React.useMemo(() => 
    categoryFilter !== undefined ? categoryFilter : filters.category
  , [categoryFilter, filters.category]);

  // Handle search changes - update URL state
  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
    // Reset to first page when searching
    setPagination({ page: 0 });
  }, [setFilters, setPagination]);

  const searchInput = React.useMemo(() => {
    if (!showSearch || searchQuery !== undefined) return null;
    
    return (
      <Box mb={2}>
        <SearchInput
          key="stable-search" // Stable key
          value={effectiveSearch}
          onChange={handleSearchChange}
          placeholder="Search products by name, SKU, or description..."
          fullWidth
        />
      </Box>
    );
  }, [showSearch, searchQuery, effectiveSearch, handleSearchChange]);

  // Build query parameters using URL state
  const queryParams: ProductsQuery = {
    page: pagination.page + 1,
    pageSize: pagination.pageSize,
    ...(effectiveSearch && { search: effectiveSearch }),
    ...(effectiveCategory && { category: effectiveCategory }),
  };


  // API queries using React Query + openapi-fetch
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const response = await apiClient.GET("/products", {
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
      
      {/* Search Section */}
      {searchInput}
      
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
                  onClick: () => setFilters({ search: "" }),
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
              rowsPerPage={pagination.pageSize}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </>
      )}
    </Box>
  );
}
