import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * Standard pagination parameters as explicit query params
 * Use by spreading into operation parameters
 */
alias PaginationParams = {
  @query @extension("x-mock-pagination", true) page?: int32 = 1;
  @query @extension("x-mock-pagination", true) pageSize?: int32 = 20;
};

/**
 * Standard sorting parameters as explicit query params
 * Use by spreading into operation parameters
 */
alias SortParams = {
  @query @extension("x-mock-sort", true) sortBy?: string;
  @query @extension("x-mock-sort", true) sortOrder?: "asc" | "desc" = "asc";
};

/**
 * Standard search parameters as explicit query params
 * Use by spreading into operation parameters
 */
alias SearchParams = {
  @query @extension("x-mock-search", #{ fields: #["email", "firstName", "lastName"] }) search?: string;
};

/**
 * Base parameters that most list endpoints need
 * Use by spreading into operation parameters
 */
alias BaseListParams = {
  ...PaginationParams;
  ...SortParams;
  ...SearchParams;
};

/**
 * Base query model that combines common list parameters
 * Use for request body scenarios or client-side models
 */
model BaseListQuery {
  /** Page number (1-based) */
  page?: int32 = 1;
  /** Number of items per page */
  pageSize?: int32 = 20;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc" = "asc";
  /** Free-text search across entity fields */
  search?: string;
}

/**
 * Standard paginated list response
 * Use as template for entity list responses
 */
model PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];
  
  /** Total number of items across all pages */
  total: int32;
  
  /** Current page number */
  page: int32;
  
  /** Number of items per page */
  pageSize: int32;
}